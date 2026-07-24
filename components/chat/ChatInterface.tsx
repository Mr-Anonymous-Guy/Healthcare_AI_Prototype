'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle,
  Send,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Bot,
  User,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  sources?: string | null;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
}

export default function ChatInterface() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  async function fetchConversations() {
    try {
      const res = await fetch('/api/chat/conversations');
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch {
      console.error('Failed to fetch conversations');
    }
  }

  async function fetchMessages(conversationId: string) {
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch {
      console.error('Failed to fetch messages');
    }
  }

  async function handleNewConversation() {
    setActiveConversationId(null);
    setMessages([]);
    setStreamingContent('');
    setInput('');
    inputRef.current?.focus();
  }

  async function handleDeleteConversation(conversationId: string) {
    try {
      await fetch(`/api/chat/conversations?id=${conversationId}`, { method: 'DELETE' });
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }
      toast.success('Conversation deleted');
    } catch {
      toast.error('Failed to delete conversation');
    }
  }

  async function handleSendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    // Optimistic UI: add user message immediately
    const optimisticUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content: trimmed,
      sources: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationId: activeConversationId,
        }),
      });

      if (res.status === 429) {
        toast.error('Rate limit exceeded. Please wait a moment.');
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Chat request failed');
      }

      // Read the SSE stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullContent = '';
      let resolvedConversationId = activeConversationId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const payload = JSON.parse(line.slice(6));

              if (payload.error) {
                toast.error(payload.error);
                break;
              }

              if (payload.conversationId && !resolvedConversationId) {
                resolvedConversationId = payload.conversationId;
                setActiveConversationId(resolvedConversationId);
              }

              if (payload.content) {
                fullContent += payload.content;
                setStreamingContent(fullContent);
              }

              if (payload.done) {
                // Add complete assistant message
                const assistantMsg: Message = {
                  id: `assistant-${Date.now()}`,
                  role: 'ASSISTANT',
                  content: fullContent,
                  sources: null,
                  createdAt: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMsg]);
                setStreamingContent('');

                // Refresh conversations list
                fetchConversations();
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      toast.error(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* ─── Conversation Sidebar ─── */}
      <div
        className={`${
          showSidebar ? 'w-72' : 'w-0'
        } transition-all duration-300 border-r border-slate-200 bg-slate-50 flex flex-col overflow-hidden`}
      >
        <div className="p-3 border-b border-slate-200">
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all text-sm font-medium shadow-sm"
          >
            <Plus size={16} />
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm ${
                  activeConversationId === conv.id
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
                onClick={() => setActiveConversationId(conv.id)}
              >
                <MessageCircle size={14} className="shrink-0 opacity-60" />
                <span className="flex-1 truncate">{conv.title || 'Untitled'}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-600 rounded transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Main Chat Area ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
          >
            <ChevronLeft size={18} className={showSidebar ? '' : 'rotate-180'} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800">HealthAI Assistant</h2>
              <p className="text-xs text-slate-500">Medical Records Q&A</p>
            </div>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-700">
              <AlertTriangle size={12} />
              Not a diagnosis tool
            </span>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" />
          <span>
            This AI assistant helps you understand your medical records. It does{' '}
            <strong>not</strong> provide medical diagnoses or treatment advice. Always consult your
            healthcare provider.
          </span>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && !streamingContent ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                <Sparkles size={28} className="text-indigo-500" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-slate-600">Ask about your medical records</p>
                <p className="text-sm mt-1 max-w-md">
                  Upload medical documents first, then ask questions like &quot;What were my last blood
                  test results?&quot; or &quot;Summarize my recent lab report.&quot;
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-w-lg w-full">
                {[
                  'Summarize my latest lab report',
                  'What are my cholesterol levels?',
                  'List all medications mentioned',
                  'Any abnormal values in my tests?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="text-left px-3 py-2 text-sm bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 rounded-lg transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Streaming response */}
              {streamingContent && (
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-800 whitespace-pre-wrap border border-slate-100">
                    {streamingContent}
                    <span className="inline-block w-1.5 h-4 bg-indigo-500 rounded-full animate-pulse ml-0.5 align-middle" />
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && !streamingContent && (
                <div className="flex gap-3 items-start">
                  <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Loader2 size={14} className="animate-spin" />
                      Searching your records...
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your medical records..."
                rows={1}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-400 bg-slate-50 focus:bg-white transition-colors"
                style={{ maxHeight: '120px' }}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm font-medium shadow-sm"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble Component ───────────────────────────────────────
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'USER';

  return (
    <div className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
          isUser
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
            : 'bg-gradient-to-br from-indigo-500 to-purple-600'
        }`}
      >
        {isUser ? (
          <User size={14} className="text-white" />
        ) : (
          <Bot size={14} className="text-white" />
        )}
      </div>
      <div
        className={`flex-1 rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white max-w-[80%] ml-auto'
            : 'bg-slate-50 text-slate-800 border border-slate-100'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
