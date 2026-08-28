import React, { useState, useRef, useEffect } from 'react';
import { RasterizedPage } from '@/lib/pdfToImages';
import { Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Switch to target page when updated from question selection
  useEffect(() => {
    if (targetPage && targetPage >= 1 && targetPage <= pages.length) {
      setCurrentPage(targetPage);
    }
  }, [targetPage, pages.length]);

  // Keep currentPage within bounds if pages array changes
  useEffect(() => {
    if (pages.length > 0 && currentPage > pages.length) {
      setCurrentPage(1);
    }
  }, [pages.length, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(pages.length, prev + 1));
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(200, z + 15));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(50, z - 15));
  const handleResetZoom = () => setZoomLevel(100);

  const activePage = pages.find((p) => p.pageNumber === currentPage) || pages[0];

  return (
    <div className="flex flex-col h-full bg-[#EAEDF2] rounded-t-2xl md:rounded-2xl overflow-hidden select-none border border-slate-200/80 shadow-xs">
      {/* Top Dark Header Controls Bar matching Figma */}
      <div className="h-12 bg-[#2D2E32] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 flex-shrink-0">
        {/* Left: Title */}
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-semibold text-white tracking-tight">
            Answer Sheet
          </span>
        </div>

        {/* Right: Zoom Controls and Page Navigator */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Zoom controls dark pill */}
          <div className="flex items-center bg-[#3D3F47] rounded-lg p-0.5 border border-white/10 text-white shadow-2xs">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Zoom out"
              aria-label="Zoom out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 text-[11px] font-bold text-white hover:text-white/80 transition-colors min-w-[44px] text-center"
              title="Reset zoom"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Zoom in"
              aria-label="Zoom in"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page Navigator dark pill */}
          <div className="flex items-center bg-[#3D3F47] rounded-lg p-0.5 border border-white/10 text-white shadow-2xs">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Previous page"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-bold text-white min-w-[72px] text-center">
              Page {currentPage} of {pages.length || 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= pages.length}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Next page"
              aria-label="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Single Page Canvas Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6 flex flex-col items-center justify-start"
      >
        {!activePage ? (
          <div className="flex flex-col items-center justify-center my-auto p-8 text-center text-slate-400 text-sm">
            <p>No answer sheet pages to display.</p>
          </div>
        ) : (
          <div
            key={activePage.pageNumber}
            style={{
              width: `${zoomLevel}%`,
              maxWidth: `${(activePage.width / 1.4) * (zoomLevel / 100)}px`,
            }}
            className="relative transition-all duration-150 flex flex-col items-center shadow-md rounded-lg bg-white border border-slate-300/80 overflow-hidden animate-fadeIn"
          >
            {/* Page Image & Overlays */}
            <div className="relative w-full aspect-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePage.dataUrl}
                alt={`Answer sheet page ${activePage.pageNumber}`}
                className="w-full h-auto block select-none"
                draggable={false}
              />

              {/* Overlay layer for highlights */}
              {renderOverlayForPage && (
                <div className="absolute inset-0 pointer-events-auto">
                  {renderOverlayForPage(activePage.pageNumber, activePage.width, activePage.height)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


