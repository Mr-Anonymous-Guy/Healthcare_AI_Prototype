# AGENTS.md — Permanent Project Constitution

## 1. PROJECT
**HealthAI Prototype** — SIH healthcare AI assistant (not a diagnosis tool).

### Feature List:
- **Auth & Profiles**: Supabase Auth integration, user profiles, role management (Patient, Admin).
- **Dashboard & Shell**: Dynamic dashboard shell for health overview, navigation, and activity summaries.
- **Medical File Upload Pipeline**: Medical record and lab report file upload, PDF parsing (`pdfjs`), and cloud storage (`Supabase Storage`).
- **Embeddings & RAG Chat**: Context-aware medical AI assistant using OpenAI API (`text-embedding-3-small` for embeddings), `pgvector` vector storage, and RAG Q&A (non-diagnostic assistant).
- **Vitals, Symptoms & Timeline**: Health vitals monitoring, symptom tracking logs, visual charts (`Recharts`), and interactive health timeline.
- **Appointments & Notifications**: Appointment scheduling, reminder system, and email delivery (`Resend`).
- **Admin & Settings**: Administration dashboard, application configuration, audit logs, and user settings.

---

## 2. STRICT TECH STACK
Do not substitute or add alternatives:
- **Frontend & Core**: Next.js 15 App Router, React 19, TypeScript, TailwindCSS, shadcn/ui, Framer Motion, React Hook Form, Zod, TanStack Query, Zustand, Recharts
- **Backend**: Next.js API routes ONLY (no Express/NestJS/FastAPI)
- **Database & Storage**: Supabase Postgres + Prisma ORM + Supabase Auth + Supabase Storage + pgvector + Realtime
- **AI & PDF Processing**: OpenAI API (`text-embedding-3-small` for embeddings), PDF parsing (`pdfjs`)
- **Email & Toasts**: Resend (Email), Sonner (Toasts)
- **Deployment**: Vercel + Supabase

---

## 3. FOLDER STRUCTURE
The exact project tree. Every new file must go in the correct directory below — never invent a new top-level folder without prior approval:

```
├── app/          # Next.js App Router routes and API endpoints
├── components/   # React components (UI elements & feature components)
├── lib/          # Client instances, core logic, and external utility integrations
├── hooks/        # Custom React hooks
├── services/     # API service functions and business logic layer
├── prisma/       # Prisma schema, migrations, and seed scripts
├── types/        # TypeScript interfaces, types, and schema definitions
├── utils/        # Helper functions, formatters, and utilities
├── middleware/   # Next.js middleware and security route guards
├── supabase/     # Supabase SQL scripts, RLS policies, and database functions
├── public/       # Static assets, fonts, icons, and media files
└── styles/       # Global styles and Tailwind CSS configurations
```

---

## 4. MILESTONE ORDER
Do not build out of order:
1. **M1**: Foundation / Prisma schema
2. **M2**: Auth
3. **M3**: Dashboard shell / Profile
4. **M4**: File upload pipeline
5. **M5**: Embeddings / RAG chat
6. **M6**: Vitals / Symptoms / Timeline
7. **M7**: Appointments / Notifications
8. **M8**: Admin / Settings
9. **M9**: Hardening / Deploy

---

## 5. STANDING GUARDRAILS
- Never auto-run destructive SQL (`migrate reset`, `DROP`) — output SQL for review instead.
- Never run `prisma migrate deploy` against production without explicit go-ahead in that message.
- Never commit `.env` files or hardcode API keys — use env vars provided in chat, referenced by name only.
- RLS policies are written as a reviewable `.sql` file, not applied automatically.
- **Supabase Migration Workflow**: Any new schema or RLS policy changes must be created as standard migration files via `npx supabase migration new <name>` directly inside `supabase/migrations/` to keep local files synchronized with the remote project and prevent CI migration drift.
- After finishing a milestone, stop and report — do not start the next milestone unprompted.
