'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { TopBar } from '@/components/shell/TopBar';
import { UploadZone, UploadedFileData } from '@/components/upload/UploadZone';
import { ProcessingStepper, PipelineStage } from '@/components/upload/ProcessingStepper';
import { QuestionList } from '@/components/results/QuestionList';
import { AnswerSheetViewer } from '@/components/results/AnswerSheetViewer';
import { HighlightOverlay } from '@/components/results/HighlightOverlay';
import { ArrowRight, Sparkles, AlertCircle, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { rasterizeDocument, RasterizedPage } from '@/lib/pdfToImages';
import { Question, AnswerBlock, Mapping, UnmatchedAnswer, Grade, OverallSummary } from '@/lib/types';

export type AppViewState = 'upload' | 'processing' | 'results';

export default function Home() {
  const [viewState, setViewState] = useState<AppViewState>('upload');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // File Upload State
  const [questionPaper, setQuestionPaper] = useState<UploadedFileData | null>(null);
  const [answerSheet, setAnswerSheet] = useState<UploadedFileData | null>(null);
  const [qpError, setQpError] = useState<string | null>(null);
  const [asError, setAsError] = useState<string | null>(null);

  // Pipeline State
  const [currentStage, setCurrentStage] = useState<PipelineStage>('extract_questions');
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Pipeline Data State
  const [rasterizedPages, setRasterizedPages] = useState<RasterizedPage[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answerBlocks, setAnswerBlocks] = useState<AnswerBlock[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [unmatchedAnswers, setUnmatchedAnswers] = useState<UnmatchedAnswer[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [overallSummary, setOverallSummary] = useState<OverallSummary | null>(null);

  // Selection & Navigation State
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [targetPage, setTargetPage] = useState<number | undefined>(undefined);

  const canStartMapping = Boolean(questionPaper && answerSheet && !qpError && !asError);

  const mappingMap = useMemo(() => {
    const map = new Map<string, Mapping>();
    mappings.forEach((m) => map.set(m.questionId, m));
    return map;
  }, [mappings]);

  const answerBlockMap = useMemo(() => {
    const map = new Map<string, AnswerBlock>();
    answerBlocks.forEach((a) => map.set(a.id, a));
    return map;
  }, [answerBlocks]);

  const questionMap = useMemo(() => {
    const map = new Map<string, Question>();
    questions.forEach((q) => map.set(q.id, q));
    return map;
  }, [questions]);

  // Selected question object
  const selectedQuestion = useMemo(() => {
    return questions.find((q) => q.id === selectedQuestionId) || null;
  }, [questions, selectedQuestionId]);

  // Find all answer blocks for the selected question
  const selectedAnswerBlocks = useMemo(() => {
    if (!selectedQuestionId) return [];
    const mapping = mappingMap.get(selectedQuestionId);
    if (!mapping || !mapping.answerBlockIds) return [];
    return mapping.answerBlockIds
      .map((id) => answerBlockMap.get(id))
      .filter((b): b is AnswerBlock => Boolean(b));
  }, [selectedQuestionId, mappingMap, answerBlockMap]);

  // Multi-page detection for the selected question
  const selectedQuestionPages = useMemo(() => {
    const pages = new Set<number>();
    selectedAnswerBlocks.forEach((block) => {
      block.bbox.forEach((box) => pages.add(box.page));
    });
    return Array.from(pages).sort((a, b) => a - b);
  }, [selectedAnswerBlocks]);

  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestionId(q.id);

    // Auto-scroll AnswerSheetViewer to first page containing the answer
    const mapping = mappingMap.get(q.id);
    if (mapping && mapping.answerBlockIds.length > 0) {
      for (const blockId of mapping.answerBlockIds) {
        const block = answerBlockMap.get(blockId);
        if (block && block.bbox.length > 0) {
          setTargetPage(block.bbox[0].page);
          break;
        }
      }
    }
  };

  const runPipeline = async () => {
    if (!questionPaper || !answerSheet) return;

    setViewState('processing');
    setIsSidebarCollapsed(true);
    setProcessingError(null);

    try {
      // Step 0: Rasterize Answer Sheet
      const rasterPages = await rasterizeDocument(answerSheet.file);
      setRasterizedPages(rasterPages);

      // Stage 1: Extract Questions
      setCurrentStage('extract_questions');
      const qpFormData = new FormData();
      qpFormData.append('file', questionPaper.file);

      const qpRes = await fetch('/api/extract-questions', {
        method: 'POST',
        body: qpFormData,
      });

      if (!qpRes.ok) {
        const errData = await qpRes.json().catch(() => ({ error: 'Failed to extract questions' }));
        throw new Error(errData.error || 'Failed to extract questions from question paper');
      }

      const qpData: { questions: Question[] } = await qpRes.json();
      setQuestions(qpData.questions);

      // Stage 2: Extract Answers
      setCurrentStage('extract_answers');
      const asFormData = new FormData();
      asFormData.append('file', answerSheet.file);

      const asRes = await fetch('/api/extract-answers', {
        method: 'POST',
        body: asFormData,
      });

      if (!asRes.ok) {
        const errData = await asRes.json().catch(() => ({ error: 'Failed to extract answers' }));
        throw new Error(errData.error || 'Failed to extract handwritten answers');
      }

      const asData: { answerBlocks: AnswerBlock[] } = await asRes.json();
      setAnswerBlocks(asData.answerBlocks);

      // Stage 3: Map Answers to Questions
      setCurrentStage('map_answers');
      const mapRes = await fetch('/api/map-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: qpData.questions,
          answerBlocks: asData.answerBlocks,
        }),
      });

      if (!mapRes.ok) {
        const errData = await mapRes.json().catch(() => ({ error: 'Failed to map answers' }));
        throw new Error(errData.error || 'Failed to map answers to questions');
      }

      const mapData: { mappings: Mapping[]; unmatchedAnswers: UnmatchedAnswer[] } = await mapRes.json();
      setMappings(mapData.mappings);
      setUnmatchedAnswers(mapData.unmatchedAnswers);

      // Stage 4: Grade
      setCurrentStage('grade');
      const gradeRes = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: qpData.questions,
          answerBlocks: asData.answerBlocks,
          mappings: mapData.mappings,
        }),
      });

      if (!gradeRes.ok) {
        const errData = await gradeRes.json().catch(() => ({ error: 'Failed to grade answers' }));
        throw new Error(errData.error || 'Failed to grade answers');
      }

      const gradeData: { grades: Grade[]; overallSummary: OverallSummary } = await gradeRes.json();
      setGrades(gradeData.grades);
      setOverallSummary(gradeData.overallSummary);

      // Default select first question
      if (qpData.questions.length > 0) {
        setSelectedQuestionId(qpData.questions[0].id);
        const firstMap = mapData.mappings.find((m) => m.questionId === qpData.questions[0].id);
        if (firstMap && firstMap.answerBlockIds.length > 0) {
          const firstBlock = asData.answerBlocks.find((b) => b.id === firstMap.answerBlockIds[0]);
          if (firstBlock && firstBlock.bbox.length > 0) {
            setTargetPage(firstBlock.bbox[0].page);
          }
        }
      }

      setCurrentStage('completed');
      setViewState('results');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during processing';
      setProcessingError(message);
    }
  };

  const handleBackToUpload = () => {
    setViewState('upload');
    setIsSidebarCollapsed(false);
    setProcessingError(null);
  };

  // Render Highlight Overlays for a given page
  const renderOverlayForPage = (pageNumber: number) => {
    const overlays: React.ReactNode[] = [];

    // 1. Render active highlights for the currently selected question
    if (selectedQuestion) {
      selectedAnswerBlocks.forEach((block) => {
        block.bbox.forEach((box, bIdx) => {
          if (box.page === pageNumber) {
            const labelText = `Q${selectedQuestion.number}${selectedQuestion.subpart ? `(${selectedQuestion.subpart})` : ''}`;
            overlays.push(
              <HighlightOverlay
                key={`selected-${block.id}-${bIdx}`}
                bbox={box}
                label={labelText}
                isActive={true}
              />
            );
          }
        });
      });
    } else {
      // 2. If no question is explicitly selected, render all answer blocks subtly
      answerBlocks.forEach((block) => {
        block.bbox.forEach((box, bIdx) => {
          if (box.page === pageNumber) {
            overlays.push(
              <HighlightOverlay
                key={`all-${block.id}-${bIdx}`}
                bbox={box}
                label={block.detectedLabel ? `Q${block.detectedLabel}` : 'Ans'}
                isActive={false}
                onClick={() => {
                  // Find question that maps to this block
                  const mapping = mappings.find((m) => m.answerBlockIds.includes(block.id));
                  if (mapping) {
                    const q = questionMap.get(mapping.questionId);
                    if (q) handleSelectQuestion(q);
                  }
                }}
              />
            );
          }
        });
      }
    )}

    return overlays;
  };

  return (
    <div className="flex h-screen w-full bg-slate-bg overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeSection="Exams"
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar
          showBack={viewState !== 'upload'}
          onBack={handleBackToUpload}
          breadcrumbCurrent="Exams"
          teacherName="Mrs. Sharma"
        />

        {/* View State: Upload */}
        {viewState === 'upload' && (
          <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-5xl mx-auto w-full overflow-y-auto">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-full bg-primary-peach/20 p-1 ring-4 ring-primary-peach/30 flex items-center justify-center shadow-md">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl shadow-inner">
                  👩‍🏫
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-white" />
              </div>
            </div>

            <div className="text-center mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-text-primary tracking-tight flex flex-wrap items-center justify-center gap-2">
                <span>Upload</span>
                <span className="inline-block px-3 py-1 bg-highlight-peach text-white rounded-full text-xl md:text-2xl font-bold shadow-sm">
                  Question Paper &amp; Answer Sheets
                </span>
              </h1>
              <p className="text-sm text-slate-text-secondary mt-2 font-medium">
                Upload both files to get started
              </p>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
              <UploadZone
                label="Upload"
                typeHighlight="Question Paper"
                fileData={questionPaper}
                onFileSelect={setQuestionPaper}
                onFileRemove={() => setQuestionPaper(null)}
                error={qpError}
                onErrorChange={setQpError}
                maxSizeMB={10}
              />

              <UploadZone
                label="Upload"
                typeHighlight="Answer Sheet"
                fileData={answerSheet}
                onFileSelect={setAnswerSheet}
                onFileRemove={() => setAnswerSheet(null)}
                error={asError}
                onErrorChange={setAsError}
                maxSizeMB={10}
              />
            </div>

            <div className="flex flex-col items-center gap-3">
              <Button
                variant="charcoal"
                size="lg"
                disabled={!canStartMapping}
                onClick={runPipeline}
                rightIcon={<ArrowRight className="w-4 h-4 ml-2" />}
                className="px-8 py-3 text-sm font-semibold rounded-full shadow-md"
              >
                Start Mapping
              </Button>

              <p className="text-xs text-slate-text-secondary font-medium text-center">
                Once both files are uploaded, you&apos;ll be able to map answers with questions.
              </p>
            </div>
          </main>
        )}

        {/* View State: Processing */}
        {viewState === 'processing' && (
          <main className="flex-1 flex items-center justify-center p-6 w-full overflow-y-auto">
            <ProcessingStepper
              currentStage={currentStage}
              error={processingError}
              onRetry={runPipeline}
              onCancel={handleBackToUpload}
            />
          </main>
        )}

        {/* View State: Results Split Pane */}
        {viewState === 'results' && (
          <main className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Panel: Question List (~400px wide) */}
            <div className="w-full md:w-[410px] h-full flex-shrink-0 flex flex-col border-r border-slate-border">
              <QuestionList
                questions={questions}
                selectedQuestionId={selectedQuestionId}
                onSelectQuestion={handleSelectQuestion}
                mappings={mappings}
                grades={grades}
              />
            </div>

            {/* Right Panel: Answer Sheet Viewer with Highlights */}
            <div className="flex-1 h-full flex flex-col min-w-0 relative">
              {/* Multi-page banner indicator if selected answer spans multiple pages */}
              {selectedQuestionPages.length > 1 && (
                <div className="bg-primary-light/90 border-b border-primary/20 px-4 py-2 flex items-center justify-between text-xs text-primary font-semibold z-10 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>
                      Answer for Q{selectedQuestion?.number} spans {selectedQuestionPages.length} pages (Pages {selectedQuestionPages.join(', ')})
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {selectedQuestionPages.map((p) => (
                      <button
                        key={p}
                        onClick={() => setTargetPage(p)}
                        className="px-2 py-0.5 rounded bg-white text-primary text-xs font-bold shadow-xs hover:bg-primary hover:text-white transition-colors"
                      >
                        Go to Page {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Unanswered banner if selected question is unanswered */}
              {selectedQuestion && mappingMap.get(selectedQuestion.id)?.status === 'unanswered' && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2 text-xs text-status-error font-medium z-10 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Question {selectedQuestion.number} was identified as unanswered on the student&apos;s answer sheet.
                  </span>
                </div>
              )}

              <AnswerSheetViewer
                pages={rasterizedPages}
                targetPage={targetPage}
                renderOverlayForPage={renderOverlayForPage}
              />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
