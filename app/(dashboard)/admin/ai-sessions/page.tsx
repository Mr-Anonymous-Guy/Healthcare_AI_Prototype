'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Bot,
  ArrowLeft,
  Search,
  Loader2,
  MessageCircle,
  Eye,
  User,
  X,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface ChatSessionItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    profile?: { fullName?: string } | null;
  };
  _count: {
    messages: number;
  };
}

interface TranscriptData {
  id: string;
  title: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    profile?: { fullName?: string } | null;
  };
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
  }>;
}

export default function AdminAISessionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ conversations: ChatSessionItem[] }>({
    queryKey: ['admin-ai-sessions', searchTerm],
    queryFn: async () => {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const res = await fetch(`/api/admin/ai-sessions${query}`);
      if (!res.ok) throw new Error('Failed to fetch AI chat sessions');
      return res.json();
    },
  });

  const { data: transcriptData, isLoading: isTranscriptLoading } = useQuery<{ conversation: TranscriptData }>({
    queryKey: ['admin-ai-transcript', activeSessionId],
    enabled: !!activeSessionId,
    queryFn: async () => {
      const res = await fetch(`/api/admin/ai-sessions/${activeSessionId}`);
      if (!res.ok) throw new Error('Failed to fetch chat transcript');
      return res.json();
    },
  });

  const conversations = data?.conversations || [];
  const transcript = transcriptData?.conversation;

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
            <Bot className="w-6 h-6 text-purple-600" /> AI RAG Chat Sessions & QA Monitor
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Read-only conversation log & transcript viewer for safety monitoring and AI assistant QA review.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search thread title, user email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-6">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600 mb-2" />
            <span>Fetching AI chat sessions...</span>
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">
            No RAG AI chat sessions found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-4">Thread Title</th>
                  <th className="py-3.5 px-4">Patient User</th>
                  <th className="py-3.5 px-4">Message Count</th>
                  <th className="py-3.5 px-4">Started Date</th>
                  <th className="py-3.5 px-4 text-right">Transcript Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {conversations.map((conv) => (
                  <tr key={conv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>{conv.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <Link
                          href={`/admin/users/${conv.user.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 hover:underline block text-xs"
                        >
                          {conv.user.profile?.fullName || 'Anonymous Patient'}
                        </Link>
                        <span className="text-[11px] text-slate-400">{conv.user.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                        {conv._count.messages} Messages
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(conv.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setActiveSessionId(conv.id)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Read Transcript
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Read-Only Transcript Viewer Modal */}
      {activeSessionId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {transcript?.title || 'Chat Transcript'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Patient: {transcript?.user.email} • Read-Only QA Safety Review
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSessionId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
              {isTranscriptLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-sm">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600 mb-2" />
                  <span>Loading full conversation transcript...</span>
                </div>
              ) : !transcript || transcript.messages.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-8 italic">
                  No messages stored in this chat session.
                </p>
              ) : (
                transcript.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-white/10 text-[10px] opacity-80 font-bold uppercase tracking-wider">
                        <span>{msg.role === 'user' ? 'Patient Prompt' : 'HealthAI Assistant'}</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Non-Diagnostic QA Safety Certified
              </span>
              <button
                onClick={() => setActiveSessionId(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
