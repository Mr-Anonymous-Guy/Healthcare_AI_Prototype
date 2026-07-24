# HealthAI Prototype

> **Predictive & Preventive Healthcare AI Assistant**  
> *Built for the Smart India Hackathon (SIH) Healthcare Track.*  
> ⚠️ **Notice**: HealthAI Assistant is an informational and document organization assistant. It is **not** a certified medical device and does **not** provide clinical diagnoses or treatment prescriptions.

---

## 📌 Project Overview

**HealthAI Prototype** is a comprehensive, privacy-first healthcare AI platform designed to empower patients and healthcare providers. It provides non-diagnostic medical record extraction, vector-based RAG document intelligence, real-time vitals monitoring, symptom tracking, appointment management, and a complete admin monitoring console.

---

## 🛠️ Strict Tech Stack

* **Frontend & Framework**: Next.js 15 (App Router), React 19, TypeScript 5.7, TailwindCSS 3.4, Framer Motion 12, Lucide Icons
* **State & Forms**: TanStack Query (React Query v5), Zustand 5, React Hook Form 7, Zod 3.24
* **Database & Storage**: Supabase Postgres, Prisma ORM 6.2, Supabase Storage, `pgvector` (Vector Storage)
* **AI & Document Processing**: OpenAI API (`text-embedding-3-small` for embeddings), PDF parsing (`pdfjs-dist` 4.10)
* **Email & UI Toasts**: Resend 4.1, Sonner 1.7
* **Deployment & CI**: Vercel + Supabase, GitHub Actions (`.github/workflows/ci.yml`)

---

## 📁 Folder Structure Overview

```text
├── app/          # Next.js App Router routes and Server-Side API endpoints
│   ├── (auth)/   # Unauthenticated auth routes (login, register, forgot-password)
│   ├── (dashboard)/ # Authenticated dashboard shell & patient/admin pages
│   └── api/      # Server API route handlers (chat, files, vitals, admin, etc.)
├── components/   # Modular UI components (Dashboard, Widgets, Landing, Auth)
├── lib/          # External integrations (Supabase, Prisma, OpenAI, Rate Limiter)
├── hooks/        # Custom React hooks
├── services/     # Core business logic layer (PDF extraction, RAG embeddings, Admin queries)
├── prisma/       # Database schema (schema.prisma), seed scripts, and migrations
├── supabase/     # Reviewable RLS policies (production_rls.sql) & SQL helper scripts
├── public/       # Static assets, media, icons, and product demo videos
├── styles/       # Global CSS tokens and Tailwind CSS configurations
├── types/        # TypeScript type interfaces and schema definitions
├── utils/        # Helper utility functions and error handlers
└── middleware.ts # Global security, CORS, auth route guards & IP rate limiting
```

---

## 🚀 Quick Start & Setup

### Prerequisites

* Node.js v20+
* npm or pnpm
* Supabase Postgres database with `pgvector` extension enabled

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Mr-Anonymous-Guy/Healthcare_AI_Prototype.git
   cd Healthcare_AI_Prototype
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your keys:

   ```bash
   cp .env.example .env
   ```

   *Required variables*:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `DATABASE_URL` (Supabase Connection Pooler)
   * `DIRECT_URL` (Supabase Direct Connection)
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `OPENAI_API_KEY` (or OpenRouter fallback)
   * `RESEND_API_KEY`
   * `SITE_URL`

4. **Initialize Prisma Database Schema**:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Development Server**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## ✨ Core Feature Overview

### 👤 Patient Portal

* **Auth & Profiles**: Supabase Auth integration, session management, and profile customization.
* **Health Dashboard**: Dynamic dashboard shell with health score indicators, upcoming appointments, and quick action widgets.
* **Medical Reports & PDF Pipeline**: Upload medical PDFs/images, extract structured text via `pdfjs`, and generate vector embeddings.
* **AI Chat Assistant (RAG)**: Non-diagnostic conversational AI assistant querying user-scoped document embeddings via `pgvector`.
* **Vitals & Symptoms Analytics**: Recharts data visualization for heart rate, blood pressure, SpO2, glucose, and symptom severity logs.
* **Appointments**: Appointment booking, cancellations, in-app reminder badges, and automated email confirmations via Resend.
* **Unified Health Timeline**: Chronological activity feed consolidating medical files, vitals entries, and doctor visits.

### 🛡️ Admin Operations Console (`/admin`)

* **System Overview**: Live aggregate metric cards monitoring users, reports, appointments, vitals logs, and AI sessions.
* **User Directory**: Central user management and per-patient detailed activity logs.
* **Medical Files Monitor**: System-wide PDF storage audit with text preview modals and administrative deletion actions.
* **Appointments Log**: System-wide appointment status filters and cancellation overrides.
* **Health Analytics & Anomaly Flagging**: Real-time vital alert detection for critical physiological thresholds (SpO2 < 95%, HR > 100).
* **AI Chat Sessions & Security Audit Logs**: Read-only transcript auditing and system audit logging for state-changing operations.

---

## 🔒 Security Architecture

* **Rate Limiting**: Sliding-window rate limiting tracking both IP address and User ID, with strict limits on authentication, AI chat, file uploads, and global API routes. Supports Upstash Redis for serverless scale with in-memory fallback.
* **Role-Based Access Control (RBAC)**: Server-side `requireRole(['ADMIN'])` guards enforcing database-verified role permissions.
* **Row-Level Security (RLS)**: Comprehensive SQL policies (`supabase/production_rls.sql`) enforcing `auth.uid() = user_id OR public.is_admin()`.
* **RAG Document Isolation**: Vector similarity queries strictly filtered to `user_id = $2::uuid` to prevent cross-patient data leakage.
* **Transport & Security Headers**: Strict Content-Security-Policy (CSP), HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and origin-locked CORS verification.
* **PII & Error Protection**: Production errors sanitized to prevent stack trace disclosure; zero PHI/PII written to server console logs.

---

## 🌐 Deployment

* **Hosting & Database**: Deployed on **Vercel** connected to **Supabase Postgres**.
* **Continuous Integration**: GitHub Actions pipeline (`.github/workflows/ci.yml`) runs automated linting, TypeScript type checking, Prisma validation, and Next.js production builds on every pull request and push to `main`.
* **Automated Dependency Auditing**: Dependabot security updates configured in `.github/dependabot.yml`.

---

## ℹ️ Developer Note on Internal Project Specifications

> **Notice**: `AGENTS.md` (Project Constitution) and `BUILD_GUIDE.md` (Milestone Checklist) serve as the project's internal development specification and progress tracker. They are gitignored to maintain clean production repository boundaries, but can be maintained locally during active development cycles.

---

## ⚖️ Medical Disclaimer

HealthAI Prototype is developed as a hackathon demonstration for the Smart India Hackathon (SIH). It is **not** a certified medical device, diagnostic system, or clinical decision tool. Users should always consult a qualified medical professional for health advice, clinical diagnosis, or treatment decisions.

---

## 👥 Credits & Team

* **Event**: Smart India Hackathon (SIH)
* **Track**: Healthcare & HealthTech
* **Team**: Team AI Healthcare
