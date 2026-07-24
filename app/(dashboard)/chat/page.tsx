import { requireAuth } from '@/lib/auth/session';
import ChatInterface from '@/components/chat/ChatInterface';

export default async function ChatPage() {
  await requireAuth();

  return (
    <div className="h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Health Assistant</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ask questions about your uploaded medical records
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
