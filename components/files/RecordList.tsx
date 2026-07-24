'use client';

import { useState } from 'react';
import { deleteFileAction } from '@/lib/actions/fileActions';
import { toast } from 'sonner';
import { FileText, Trash2, Eye, Download, Sparkles, CheckCircle2 } from 'lucide-react';

interface RecordListProps {
  files: any[];
  onFileDeleted?: () => void;
}

export default function RecordList({ files, onFileDeleted }: RecordListProps) {
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    setIsDeleting(fileId);

    try {
      const res = await deleteFileAction(fileId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Document deleted successfully');
        if (selectedFile?.id === fileId) {
          setSelectedFile(null);
        }
        if (onFileDeleted) {
          onFileDeleted();
        }
      }
    } catch (err: any) {
      toast.error('Failed to delete file');
    } finally {
      setIsDeleting(null);
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-gray-800">No medical records uploaded yet</h4>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          Upload your lab reports, prescriptions, or radiology scans to store and extract text chunks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Uploaded Documents ({files.length})</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {files.map((file) => {
            const report = file.medicalReport;
            let chunkData: any = null;

            if (report?.summary) {
              try {
                chunkData = JSON.parse(report.summary);
              } catch (e) {
                chunkData = null;
              }
            }

            return (
              <div
                key={file.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {report?.title || file.fileName}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                      <span className="font-semibold text-blue-600 uppercase">
                        {report?.reportType || 'DOCUMENT'}
                      </span>
                      <span>•</span>
                      <span>{(file.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {chunkData && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      {chunkData.totalChunks || 0} Chunks
                    </span>
                  )}

                  <button
                    onClick={() => setSelectedFile({ ...file, chunkData })}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="View Document Details & Chunks"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Download Original File"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDelete(file.id)}
                    disabled={isDeleting === file.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {selectedFile.medicalReport?.title || selectedFile.fileName}
                </h3>
                <p className="text-[10px] text-gray-500">
                  {selectedFile.mimeType} • {selectedFile.chunkData?.totalChunks || 0} Chunks Stored
                </p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Parsed Document Chunks:
                </h4>

                {selectedFile.chunkData?.chunks?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedFile.chunkData.chunks.map((chunk: any) => (
                      <div
                        key={chunk.chunkIndex}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      >
                        <div className="flex justify-between font-bold text-blue-700 mb-1">
                          <span>Chunk #{chunk.chunkIndex + 1}</span>
                          <span className="text-gray-400 font-normal">
                            {chunk.charCount} chars • {chunk.wordCount} words
                          </span>
                        </div>
                        <p className="text-gray-800 font-mono bg-white p-2.5 rounded border border-slate-200 leading-relaxed text-[11px]">
                          {chunk.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No text chunks extracted.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
