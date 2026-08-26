import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export interface UploadedFileData {
  file: File;
  name: string;
  size: number;
  type: string;
  pageCount?: number;
  previewUrl?: string;
}

export interface UploadZoneProps {
  label: string;
  typeHighlight: string;
  accept?: string;
  maxSizeMB?: number;
  fileData: UploadedFileData | null;
  onFileSelect: (fileData: UploadedFileData) => void;
  onFileRemove: () => void;
  error?: string | null;
  onErrorChange?: (error: string | null) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  label,
  typeHighlight,
  accept = 'application/pdf,image/png,image/jpeg,image/jpg',
  maxSizeMB = 10,
  fileData,
  onFileSelect,
  onFileRemove,
  error,
  onErrorChange,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateAndProcessFile = (file: File) => {
    // Reset error
    onErrorChange?.(null);

    // Validate size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      onErrorChange?.(`File is too large. Max limit is ${maxSizeMB}MB.`);
      return;
    }

    // Validate type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg)$/i)) {
      onErrorChange?.('Unsupported file type. Please upload a PDF or image (PNG/JPG).');
      return;
    }

    const previewUrl = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : undefined;

    onFileSelect({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      pageCount: file.type === 'application/pdf' ? undefined : 1,
      previewUrl,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {!fileData ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={clsx(
            'group relative flex flex-col items-center justify-center p-8 text-center rounded-2xl border-2 border-dashed transition-all cursor-pointer bg-white min-h-[220px]',
            error
              ? 'border-status-error bg-red-50/20'
              : isDragOver
              ? 'border-primary bg-primary-light/30 shadow-md scale-[1.01]'
              : 'border-slate-border hover:border-primary/60 hover:bg-slate-50/70 shadow-sm'
          )}
        >
          {/* Upload Icon Box */}
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-border group-hover:border-primary/40 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all mb-4 shadow-sm group-hover:scale-105">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div className="text-base font-semibold text-slate-text-primary">
            {label}{' '}
            <span className="text-primary font-bold">{typeHighlight}</span>
          </div>

          <p className="text-xs text-slate-text-secondary mt-1.5 font-medium">
            Drag & drop or <span className="text-primary underline">browse</span> (Max {maxSizeMB}MB)
          </p>

          {error && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-status-error font-medium bg-red-50 px-3 py-1.5 rounded-lg border border-status-error/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        /* Attached / Valid file compact chip card */
        <div className="relative flex items-center justify-between p-5 rounded-2xl border border-slate-border bg-white shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center gap-4 min-w-0">
            {/* File Type Badge */}
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-status-error flex-shrink-0">
              <FileText className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-wider">
                {fileData.type.includes('pdf') ? 'PDF' : 'IMG'}
              </span>
            </div>

            {/* File info */}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-text-primary truncate max-w-[200px] sm:max-w-[280px]">
                {fileData.name}
              </div>
              <div className="text-xs text-slate-text-secondary mt-0.5 font-medium">
                {formatFileSize(fileData.size)}
                {fileData.pageCount !== undefined && ` • ${fileData.pageCount} ${fileData.pageCount === 1 ? 'Page' : 'Pages'}`}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pl-2">
            <div className="w-7 h-7 rounded-full bg-highlight-green-light text-status-success flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-status-error hover:bg-red-50 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
