import { requireRole } from '@/lib/auth/session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side database role check: enforces ADMIN role on all /admin/* pages
  await requireRole(['ADMIN']);

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] font-sans selection:bg-indigo-500 selection:text-white">
      {children}
    </div>
  );
}
