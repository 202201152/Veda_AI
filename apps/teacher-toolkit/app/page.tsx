'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { TopBar } from '@/components/shell/TopBar';
import { UploadZone, UploadedFileData } from '@/components/upload/UploadZone';
import { ProcessingStepper, PipelineStage } from '@/components/upload/ProcessingStepper';
import { QuestionList } from '@/components/results/QuestionList';
import { AnswerSheetViewer } from '@/components/results/AnswerSheetViewer';
import { HighlightOverlay } from '@/components/results/HighlightOverlay';
import { ArrowRight, Layers, AlertCircle } from 'lucide-react';
import { rasterizeDocument, RasterizedPage } from '@/lib/pdfToImages';
import { Question, AnswerBlock, Mapping, UnmatchedAnswer, Grade, OverallSummary } from '@/lib/types';
import { clsx } from 'clsx';

export type AppViewState = 'upload' | 'processing' | 'results';
export type MobileTab = 'questions' | 'answers';

export default function Home() {
  const [viewState, setViewState] = useState<AppViewState>('upload');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('questions');

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
  const [selectedUnmatchedId, setSelectedUnmatchedId] = useState<string | null>(null);
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
    setSelectedUnmatchedId(null);

    // On mobile, auto-switch to Answer Sheet tab
    setMobileTab('answers');

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

  const handleSelectUnmatched = (blockId: string) => {
    setSelectedUnmatchedId(blockId);
    setSelectedQuestionId(null);
    setMobileTab('answers');

    const block = answerBlockMap.get(blockId);
    if (block && block.bbox.length > 0) {
      setTargetPage(block.bbox[0].page);
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

  const renderOverlayForPage = (pageNumber: number) => {
    const overlays: React.ReactNode[] = [];

    if (selectedUnmatchedId) {
      const unmatchedBlock = answerBlockMap.get(selectedUnmatchedId);
      if (unmatchedBlock) {
        unmatchedBlock.bbox.forEach((box, bIdx) => {
          if (box.page === pageNumber) {
            overlays.push(
              <HighlightOverlay
                key={`unmatched-${unmatchedBlock.id}-${bIdx}`}
                bbox={box}
                label="Unmatched"
                isUnmatched={true}
                isActive={true}
              />
            );
          }
        });
      }
      return overlays;
    }

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
      });
    }

    return overlays;
  };

  return (
    <div className="flex h-screen w-full bg-[#EAEDF2] p-2.5 sm:p-3 md:p-3.5 gap-2.5 sm:gap-3.5 overflow-hidden select-none">
      {/* Floating Left Sidebar - hidden on mobile screens, collapsible on desktop */}
      <div className={clsx(
        'hidden md:block h-full flex-shrink-0',
        isMobileSidebarOpen && '!block fixed inset-y-0 left-0 z-50 p-3 shadow-2xl md:static md:p-0 md:shadow-none'
      )}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeSection="Exams"
        />
      </div>

      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Floating Workspace Card */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-white rounded-[28px] border border-slate-200/80 shadow-sm overflow-hidden">
        <TopBar
          showBack={viewState !== 'upload'}
          onBack={handleBackToUpload}
          breadcrumbCurrent="Exams"
          teacherName="Madhur Rastogi"
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* View State: Upload */}
        {viewState === 'upload' && (
          <main className="flex-1 flex flex-col items-center justify-start sm:justify-center p-3 sm:p-5 md:p-6 max-w-4xl mx-auto w-full overflow-y-auto no-scrollbar pb-6 sm:pb-6">
            {/* Centered Heading matching Desktop & Mobile Figma designs */}
            <div className="text-center mb-1.5 sm:mb-3 mt-1 sm:mt-0">
              {/* Desktop Headline */}
              <h1 className="hidden sm:flex text-2xl sm:text-3xl md:text-[32px] font-extrabold text-[#0F172A] tracking-tight flex-wrap items-center justify-center gap-2">
                <span>Upload</span>
                <span className="inline-block px-4 py-1 bg-[#FEEAE6] text-[#F4522D] rounded-full text-xl sm:text-2xl md:text-[26px] font-extrabold shadow-2xs">
                  Question Paper &amp; Answer Sheets
                </span>
              </h1>

              {/* Mobile Headline matching phone Figma screenshot */}
              <h1 className="sm:hidden text-[22px] font-extrabold text-[#0F172A] tracking-tight leading-snug">
                Upload <span className="underline decoration-slate-300 underline-offset-4">Question Paper</span><br />
                &amp; Answer Sheets
              </h1>

              <p className="hidden sm:block text-[13px] text-[#64748B] mt-1.5 font-medium">
                Upload both files to get started
              </p>
            </div>

            {/* Teacher Illustration Avatar matching Figma Frame 1618872259 */}
            <div className="my-1.5 sm:my-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/teacher-avatar.png"
                alt="Teacher Assistant"
                className="w-28 h-28 sm:w-36 md:w-40 sm:h-36 md:h-40 object-contain select-none pointer-events-none"
              />
            </div>


            {/* Upload Zone Cards */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 my-3 sm:my-4">
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

            {/* Start Mapping Pill Button & Helper */}
            <div className="flex flex-col items-center gap-2 mt-1 sm:mt-2">
              <button
                disabled={!canStartMapping}
                onClick={runPipeline}
                className={clsx(
                  'px-9 py-2.5 sm:py-3 text-sm font-semibold rounded-full flex items-center gap-2 transition-all select-none',
                  canStartMapping
                    ? 'bg-[#333333] hover:bg-[#1E1E1E] text-white shadow-md hover:shadow cursor-pointer hover:scale-[1.01]'
                    : 'bg-[#9CA3AF] text-white opacity-80 cursor-not-allowed shadow-none'
                )}
              >
                <span>Start Mapping</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-xs text-[#94A3B8] font-medium text-center">
                Once both files are uploaded, you&apos;ll be able to map answers with questions
              </p>
            </div>
          </main>
        )}

        {/* View State: Processing */}
        {viewState === 'processing' && (
          <main className="flex-1 flex items-center justify-center p-6 w-full overflow-y-auto no-scrollbar">
            <ProcessingStepper
              currentStage={currentStage}
              error={processingError}
              onRetry={runPipeline}
              onCancel={handleBackToUpload}
            />
          </main>
        )}

        {/* View State: Results */}
        {viewState === 'results' && (
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
            {/* Mobile Tab Switcher Bar (visible on mobile only) matching Figma */}
            <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-center z-20">
              <div className="bg-[#F1F5F9] p-1 rounded-full border border-slate-200/80 inline-flex items-center gap-1">
                <button
                  onClick={() => setMobileTab('questions')}
                  className={clsx(
                    'px-5 py-1.5 rounded-full text-xs font-bold transition-all',
                    mobileTab === 'questions'
                      ? 'bg-[#333333] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  )}
                >
                  Questions
                </button>
                <button
                  onClick={() => setMobileTab('answers')}
                  className={clsx(
                    'px-5 py-1.5 rounded-full text-xs font-bold transition-all',
                    mobileTab === 'answers'
                      ? 'bg-[#333333] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  )}
                >
                  Answer Sheet
                </button>
              </div>
            </div>

            {/* Split View Container on Desktop / Tabbed View on Mobile */}
            <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden p-2 sm:p-3 md:p-4 gap-3 md:gap-4">
              {/* Left: Question List */}
              <div className={clsx(
                'w-full md:w-[420px] lg:w-[460px] h-full flex-shrink-0 flex flex-col overflow-hidden',
                mobileTab === 'answers' ? 'hidden md:flex' : 'flex'
              )}>
                <QuestionList
                  questions={questions}
                  selectedQuestionId={selectedQuestionId}
                  selectedUnmatchedId={selectedUnmatchedId}
                  onSelectQuestion={handleSelectQuestion}
                  onSelectUnmatched={handleSelectUnmatched}
                  mappings={mappings}
                  grades={grades}
                  overallSummary={overallSummary}
                  unmatchedAnswers={unmatchedAnswers}
                  answerBlocks={answerBlocks}
                />
              </div>

              {/* Right: Answer Sheet Viewer */}
              <div className={clsx(
                'flex-1 h-full flex flex-col min-w-0 relative overflow-hidden',
                mobileTab === 'questions' ? 'hidden md:flex' : 'flex'
              )}>
                {/* Multi-page banner indicator if spans pages */}
                {selectedQuestionPages.length > 1 && (
                  <div className="bg-[#FEEAE6] border-b border-[#F4522D]/20 px-4 py-2 flex items-center justify-between text-xs text-[#F4522D] font-bold z-10 animate-fadeIn">
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
                          className="px-2 py-0.5 rounded-md bg-white text-[#F4522D] text-xs font-bold shadow-2xs hover:bg-[#F4522D] hover:text-white transition-colors"
                        >
                          Page {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unanswered banner */}
                {selectedQuestion && mappingMap.get(selectedQuestion.id)?.status === 'unanswered' && (
                  <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2 text-xs text-[#DC4C3E] font-medium z-10 animate-fadeIn">
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
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

