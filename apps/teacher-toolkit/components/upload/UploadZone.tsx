import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { getDocumentPageCount } from '@/lib/pdfToImages';

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

  const validateAndProcessFile = async (file: File) => {
    onErrorChange?.(null);

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      onErrorChange?.(`File is too large. Max limit is ${maxSizeMB}MB.`);
      return;
    }

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg)$/i)) {
      onErrorChange?.('Unsupported file type. Please upload a PDF or image (PNG/JPG).');
      return;
    }

    const previewUrl = file.type.startsWith('image/')
      ? URL.createObjectURL(file)
      : undefined;

    let pageCount = 1;
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      pageCount = await getDocumentPageCount(file);
    }

    onFileSelect({
      file,
      name: file.name,
      size: file.size,
      type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      pageCount,
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
            'group relative flex flex-col items-center justify-center p-5 sm:p-7 text-center rounded-[24px] border-2 border-dashed transition-all cursor-pointer bg-white min-h-[190px] sm:min-h-[200px]',
            error
              ? 'border-[#DC4C3E] bg-red-50/20'
              : isDragOver
              ? 'border-[#F4522D] bg-[#FEEAE6]/40 shadow-sm scale-[1.01]'
              : 'border-[#CBD5E1] hover:border-[#F4522D]/70 hover:bg-[#F8FAFC] shadow-2xs'
          )}
        >
          {/* Upload icon in rounded square */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] group-hover:border-[#F4522D]/40 flex items-center justify-center text-slate-700 group-hover:text-[#F4522D] transition-all mb-2.5 sm:mb-3 shadow-2xs">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>

          <div className="text-[16px] sm:text-[17px] font-bold text-[#0F172A] tracking-tight">
            {label}{' '}
            <span className="text-[#F4522D] font-bold">{typeHighlight}</span>
          </div>

          <p className="text-xs text-[#94A3B8] mt-1 font-medium">
            Max {maxSizeMB}MB
          </p>

          {error && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[#DC4C3E] font-medium bg-red-50 px-3 py-1.5 rounded-xl border border-[#DC4C3E]/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex items-center justify-between p-6 rounded-[24px] border border-slate-200 bg-white shadow-2xs hover:shadow-sm transition-shadow min-h-[140px]">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center text-[#DC4C3E] flex-shrink-0 shadow-2xs">
              <FileText className="w-5 h-5" />
              <span className="text-[9px] font-black uppercase tracking-wider">
                {fileData.type.includes('pdf') || fileData.name.endsWith('.pdf') ? 'PDF' : 'IMG'}
              </span>
            </div>

            <div className="min-w-0">
              <div className="text-[15px] font-bold text-[#0F172A] truncate max-w-[200px] sm:max-w-[280px]">
                {fileData.name}
              </div>
              <div className="text-xs text-[#64748B] mt-0.5 font-medium">
                {formatFileSize(fileData.size)}
                {fileData.pageCount !== undefined && ` • ${fileData.pageCount} ${fileData.pageCount === 1 ? 'Page' : 'Pages'}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-2">
            <div className="w-7 h-7 rounded-full bg-[#EAF5EC] text-[#3F9142] flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-[#DC4C3E] hover:bg-red-50 transition-colors"
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

