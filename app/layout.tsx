import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import QueryProvider from '@/components/providers/QueryProvider';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'HealthAI Prototype',
  description: 'SIH Healthcare AI Assistant (Not a diagnosis tool)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
