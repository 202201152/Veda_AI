'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { TopBar } from '@/components/shell/TopBar';
import { UploadZone, UploadedFileData } from '@/components/upload/UploadZone';
import { ProcessingStepper, PipelineStage } from '@/components/upload/ProcessingStepper';
import { ArrowRight, Sparkles } from 'lucide-react';
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
  const [, setRasterizedPages] = useState<RasterizedPage[]>([]);
  const [, setQuestions] = useState<Question[]>([]);
  const [, setAnswerBlocks] = useState<AnswerBlock[]>([]);
  const [, setMappings] = useState<Mapping[]>([]);
  const [, setUnmatchedAnswers] = useState<UnmatchedAnswer[]>([]);
  const [, setGrades] = useState<Grade[]>([]);
  const [, setOverallSummary] = useState<OverallSummary | null>(null);

  const canStartMapping = Boolean(questionPaper && answerSheet && !qpError && !asError);

  const runPipeline = async () => {
    if (!questionPaper || !answerSheet) return;

    setViewState('processing');
    setIsSidebarCollapsed(true);
    setProcessingError(null);

    try {
      // Step 0: Rasterize Answer Sheet for client-side viewer
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

  return (
    <div className="flex h-screen w-full bg-slate-bg overflow-hidden">
      {/* Sidebar - automatically collapsed during processing and results, expanded on upload */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeSection="Exams"
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        <TopBar
          showBack={viewState !== 'upload'}
          onBack={handleBackToUpload}
          breadcrumbCurrent="Exams"
          teacherName="Mrs. Sharma"
        />

        {/* View State: Upload */}
        {viewState === 'upload' && (
          <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-5xl mx-auto w-full">
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
          <main className="flex-1 flex items-center justify-center p-6 w-full">
            <ProcessingStepper
              currentStage={currentStage}
              error={processingError}
              onRetry={runPipeline}
              onCancel={handleBackToUpload}
            />
          </main>
        )}

        {/* View State: Results Placeholder (Wired in subsequent tickets) */}
        {viewState === 'results' && (
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-text-primary">Results Ready</h2>
              <p className="text-sm text-slate-text-secondary mt-1">
                Extraction and grading complete.
              </p>
              <Button variant="secondary" onClick={handleBackToUpload} className="mt-4">
                Upload New Files
              </Button>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
