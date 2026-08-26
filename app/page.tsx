'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { TopBar } from '@/components/shell/TopBar';
import { UploadZone, UploadedFileData } from '@/components/upload/UploadZone';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [questionPaper, setQuestionPaper] = useState<UploadedFileData | null>(null);
  const [answerSheet, setAnswerSheet] = useState<UploadedFileData | null>(null);
  const [qpError, setQpError] = useState<string | null>(null);
  const [asError, setAsError] = useState<string | null>(null);

  const canStartMapping = Boolean(questionPaper && answerSheet && !qpError && !asError);

  const handleStartMapping = () => {
    if (!canStartMapping) return;
    // Will be wired to processing view in Ticket 07
  };

  return (
    <div className="flex h-screen w-full bg-slate-bg overflow-hidden">
      {/* Sidebar - expanded on upload screen */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeSection="Exams"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        <TopBar
          showBack={true}
          breadcrumbCurrent="Exams"
          teacherName="Mrs. Sharma"
        />

        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-5xl mx-auto w-full">
          {/* Decorative Teacher Avatar */}
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

          {/* Heading with Highlight Peach Chip */}
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

          {/* Two Upload Cards Side by Side */}
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

          {/* Start Mapping Action Button */}
          <div className="flex flex-col items-center gap-3">
            <Button
              variant="charcoal"
              size="lg"
              disabled={!canStartMapping}
              onClick={handleStartMapping}
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
      </div>
    </div>
  );
}
