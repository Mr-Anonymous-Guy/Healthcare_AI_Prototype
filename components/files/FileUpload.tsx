'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState('LAB_REPORT');
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file format. Please upload a PDF or image file (PNG, JPEG, WEBP).');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds maximum 10MB limit.');
      return;
    }

    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reportType', reportType);
      formData.append('title', title || file.name);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'File upload failed');
      }

      toast.success('Document uploaded and parsed successfully!');
      setUploadResult(data);
      setFile(null);
      setTitle('');

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err: any) {
      console.error('Upload Error:', err);
      toast.error(err.message || 'An error occurred during file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Upload Medical Document</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            PDF reports or medical images (Max 10MB)
          </p>
        </div>
        <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
          <Upload className="w-5 h-5" />
        </span>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
              : file
              ? 'border-emerald-300 bg-emerald-50/30'
              : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  Click to browse or drag and drop file here
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Supports PDF, PNG, JPG, WEBP up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Metadata Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Document Title</label>
            <input
              type="text"
              placeholder="e.g. Blood Test Report July"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="LAB_REPORT">Lab Report</option>
              <option value="RADIOLOGY">Radiology / X-Ray / Scan</option>
              <option value="PRESCRIPTION">Doctor Prescription</option>
              <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
              <option value="OTHER">Other Medical Document</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || isUploading}
          className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium text-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all shadow-sm"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing & Extracting Text...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload & Extract Text Chunks
            </>
          )}
        </button>
      </form>

      {/* Upload Processing Results Preview */}
      {uploadResult && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between text-emerald-700 font-bold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Extracted & Chunked Successfully
            </span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">
              {uploadResult.extraction?.totalChunks} Chunks Created
            </span>
          </div>

          <div className="text-gray-600">
            <p><strong>Total Text Characters:</strong> {uploadResult.extraction?.totalCharacters}</p>
          </div>

          {uploadResult.extraction?.sampleChunks?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <p className="font-bold text-gray-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Sample Generated Chunks:
              </p>
              {uploadResult.extraction.sampleChunks.map((chunk: any) => (
                <div
                  key={chunk.chunkIndex}
                  className="p-3 bg-white border border-gray-200 rounded-lg shadow-2xs text-[11px]"
                >
                  <div className="flex justify-between font-semibold text-blue-600 mb-1">
                    <span>Chunk #{chunk.chunkIndex + 1}</span>
                    <span className="text-gray-400">{chunk.charCount} chars • {chunk.wordCount} words</span>
                  </div>
                  <p className="text-gray-700 italic font-mono bg-slate-50 p-2 rounded border border-gray-100">
                    &quot;{chunk.text}&quot;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
