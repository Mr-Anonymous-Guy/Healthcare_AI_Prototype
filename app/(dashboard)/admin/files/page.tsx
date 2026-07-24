'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  FolderOpen,
  ArrowLeft,
  Search,
  Loader2,
  FileText,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  X,
  User,
} from 'lucide-react';

interface FileItem {
  id: string;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  extractedText?: string | null;
  createdAt: string;
  status: 'PARSED' | 'PENDING';
  user: {
    id: string;
    email: string;
    profile?: {
      fullName?: string;
    } | null;
  };
}

export default function AdminFilesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const { data, isLoading } = useQuery<{ files: FileItem[] }>({
    queryKey: ['admin-files', searchTerm],
    queryFn: async () => {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const res = await fetch(`/api/admin/files${query}`);
      if (!res.ok) throw new Error('Failed to fetch medical files');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const res = await fetch(`/api/admin/files/${fileId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete file');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || 'File deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-files'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      if (previewFile?.id) setPreviewFile(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete file');
    },
  });

  const files = data?.files || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-emerald-600" /> Medical Reports & PDF Storage
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            System-wide repository of uploaded patient lab reports, PDF documents, and vector chunk status.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search document name, user email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
            <span>Querying medical files repository...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">
            No uploaded medical PDF documents match criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4">Document Details</th>
                  <th className="py-3.5 px-4">Patient Owner</th>
                  <th className="py-3.5 px-4">File Size</th>
                  <th className="py-3.5 px-4">Upload Date</th>
                  <th className="py-3.5 px-4">RAG Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate max-w-xs">{file.fileName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{file.mimeType}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <Link
                          href={`/admin/users/${file.user.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 hover:underline block text-xs"
                        >
                          {file.user.profile?.fullName || 'Anonymous Patient'}
                        </Link>
                        <span className="text-[11px] text-slate-400">{file.user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600 font-mono font-medium whitespace-nowrap">
                      {(file.fileSize / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(file.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          file.status === 'PARSED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {file.status === 'PARSED' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Embedded
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Processing
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Text Preview
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${file.fileName}"? This action will emit an audit log entry.`)) {
                              deleteMutation.mutate(file.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Extracted Text Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{previewFile.fileName}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Owner: {previewFile.user.email} • {(previewFile.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider text-slate-400">Extracted PDF Text Content:</span>
                <span className="font-mono">{previewFile.extractedText?.length || 0} characters</span>
              </div>
              <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto border border-slate-800">
                {previewFile.extractedText || 'No text extracted from this file.'}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400">RAG Chunk Status: {previewFile.status}</span>
              <button
                onClick={() => setPreviewFile(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
