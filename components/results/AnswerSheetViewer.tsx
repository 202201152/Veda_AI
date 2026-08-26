import React, { useState, useRef, useEffect } from 'react';
import { RasterizedPage } from '@/lib/pdfToImages';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { clsx } from 'clsx';

export interface AnswerSheetViewerProps {
  pages: RasterizedPage[];
  targetPage?: number;
  renderOverlayForPage?: (pageNumber: number, pageWidth: number, pageHeight: number) => React.ReactNode;
}

export const AnswerSheetViewer: React.FC<AnswerSheetViewerProps> = ({
  pages,
  targetPage,
  renderOverlayForPage,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Scroll to target page when programmatically updated
  useEffect(() => {
    if (targetPage && pageRefs.current.has(targetPage)) {
      const pageEl = pageRefs.current.get(targetPage);
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurrentPage(targetPage);
      }
    }
  }, [targetPage]);

  // Track currently visible page during user scrolling
  const handleScroll = () => {
    if (!containerRef.current || pages.length <= 1) return;
    const containerTop = containerRef.current.scrollTop;

    let closestPage = 1;
    let minDistance = Infinity;

    pages.forEach((page) => {
      const el = pageRefs.current.get(page.pageNumber);
      if (el) {
        const offset = el.offsetTop - containerRef.current!.offsetTop;
        const distance = Math.abs(offset - containerTop);
        if (distance < minDistance) {
          minDistance = distance;
          closestPage = page.pageNumber;
        }
      }
    });

    setCurrentPage(closestPage);
  };

  const handlePrevPage = () => {
    const prev = Math.max(1, currentPage - 1);
    const pageEl = pageRefs.current.get(prev);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(prev);
    }
  };

  const handleNextPage = () => {
    const next = Math.min(pages.length, currentPage + 1);
    const pageEl = pageRefs.current.get(next);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentPage(next);
    }
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(200, z + 15));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(50, z - 15));
  const handleResetZoom = () => setZoomLevel(100);

  return (
    <div className="flex flex-col h-full bg-slate-100/70 select-none">
      {/* Top Controls Bar */}
      <div className="h-14 bg-white border-b border-slate-border px-4 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        {/* Left / Title info */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-text-primary">
            Answer Sheet
          </span>
          <span className="text-xs text-slate-text-secondary">
            ({pages.length} {pages.length === 1 ? 'page' : 'pages'})
          </span>
        </div>

        {/* Right: Zoom Controls and Page Navigator */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 text-xs font-semibold text-slate-700 hover:text-primary transition-colors min-w-[48px] text-center"
              title="Reset zoom"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page Navigator */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-semibold text-slate-700 min-w-[76px] text-center">
              Page {currentPage} of {pages.length || 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= pages.length}
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pages Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex flex-col items-center gap-8"
      >
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-auto p-8 text-center text-slate-text-secondary text-sm">
            <p>No answer sheet pages to display.</p>
          </div>
        ) : (
          pages.map((page) => (
            <div
              key={page.pageNumber}
              ref={(el) => {
                if (el) pageRefs.current.set(page.pageNumber, el);
                else pageRefs.current.delete(page.pageNumber);
              }}
              style={{
                width: `${zoomLevel}%`,
                maxWidth: `${(page.width / 1.5) * (zoomLevel / 100)}px`,
              }}
              className="relative transition-all duration-150 flex flex-col items-center shadow-lg rounded-xl bg-white border border-slate-200 overflow-hidden"
            >
              {/* Page Number Stamp Header */}
              <div className="w-full bg-slate-50 border-b border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-500 flex justify-between items-center">
                <span>Page {page.pageNumber}</span>
                <span className="text-[10px] text-slate-400">
                  {page.width} × {page.height}px
                </span>
              </div>

              {/* Page Image & Overlays */}
              <div className="relative w-full aspect-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.dataUrl}
                  alt={`Answer sheet page ${page.pageNumber}`}
                  className="w-full h-auto block select-none"
                  draggable={false}
                />

                {/* Overlay layer for highlights */}
                {renderOverlayForPage && (
                  <div className="absolute inset-0 pointer-events-auto">
                    {renderOverlayForPage(page.pageNumber, page.width, page.height)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
