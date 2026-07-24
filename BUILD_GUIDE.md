# BUILD_GUIDE.md — Project Execution Checklist

This document is the living progress tracking guide for **HealthAI Prototype**.
Refer to `AGENTS.md` for project rules, architecture, tech stack, and standing guardrails.

You are not my assistant.
You are the engineer responsible for finishing this project.
Before writing any code:
understand the objective
inspect the existing project
create a plan
identify risks
execute one task at a time
verify every change
fix failures automatically
continue until every requirement passes.
check all the verifications reruired in the build before comenting on completion.
Never ask me what to do next unless a decision requires a human.

---

## Milestone Progress Overview

- [x] **M1: Foundation / Prisma Schema**
- [x] **M2: Auth**
- [x] **M3: Dashboard Shell / Profile**
- [x] **M4: File Upload Pipeline**
- [x] **M5: Embeddings / RAG Chat**
- [x] **M6: Vitals / Symptoms / Timeline**
- [x] **M7: Appointments / Notifications**
- [x] **M8: Admin / Settings**
- [x] **M9: Hardening / Deploy**
- [x] **Landing Page: Public Root Page ("/")**
- [x] **Milestone: Complete Admin Monitoring Console**

---

### M1: Foundation / Prisma Schema

**Goal**: Initialize Next.js 15 App Router project structure, TailwindCSS, shadcn/ui, Supabase integration, and complete Prisma schema with pgvector support.

#### Checklist

- [x] Initialize Next.js 15 App Router project with TypeScript, TailwindCSS, and ESLint
- [x] Configure exact folder structure per `AGENTS.md` (`app/`, `components/`, `lib/`, `hooks/`, `services/`, `prisma/`, `types/`, `utils/`, `middleware/`, `supabase/`, `public/`, `styles/`)
- [x] Set up Prisma ORM with Supabase Postgres connector & `pgvector` extension support
- [x] Define Prisma data models (`User`, `Profile`, `MedicalReport`, `Appointment`, `Symptom`, `Vital`, `HealthLog`, `Conversation`, `Message`, `Notification`, `File`, `AISession`, `AuditLog`)
- [x] Configure Supabase client instances (browser and server helpers) in `lib/supabase/`
- [x] Configure global styles, shadcn/ui base configuration, and Sonner toast provider

#### Definition of Done

- [x] `npm run build` completes with zero TypeScript or build errors
- [x] Prisma schema validates cleanly via `npx prisma validate`
- [x] Prisma client compiles and exports all model types cleanly
- [x] Supabase connection helper verifies active database connection

#### Status

- **Blocked until**: None (Initial Milestone)

---

### M2: Auth

**Goal**: Implement Supabase Auth integration, session management, route guards, and role-based access control (Patient, Admin).

#### Checklist

- [x] Create Supabase Auth client & server session helpers in `lib/auth/`
- [x] Implement Auth UI forms (Login, Register, Password Reset, Magic Link) with React Hook Form & Zod validation
- [x] Build Next.js API routes for auth callback and session handling (`app/api/auth/`)
- [x] Create Next.js `middleware.ts` for route protection and session token validation
- [x] Implement role-based authorization rules (Patient vs Admin)
- [x] Write reviewable Supabase RLS policies file in `supabase/policies/01_auth_rls.sql`

#### Definition of Done

- [x] Users can register, log in, log out, and reset password via Supabase Auth
- [x] Unauthenticated users are redirected to `/login` when attempting to access protected routes
- [x] Role-based routes restrict Patient/Admin access appropriately
- [x] `01_auth_rls.sql` contains clean, reviewable RLS policy definitions

#### Status

- **Blocked until**: M1 Definition of Done is fully checked and verified

---

### M3: Dashboard Shell / Profile

**Goal**: Build responsive dashboard layout shell, navigation system, user profile management, and health metrics summary cards.

#### Checklist

- [x] Build responsive Dashboard layout shell with collapsible sidebar, topbar, and mobile navigation
- [x] Create Patient & Admin dashboard view wrappers in `app/(dashboard)/`
- [x] Implement User Profile view and edit form (`Profile` model update via React Hook Form & Zod)
- [x] Create health overview dashboard cards (quick vitals summary, recent uploads, upcoming appointments)
- [x] Integrate Zustand store for client-side dashboard state management

#### Definition of Done

- [x] Dashboard layout renders cleanly on desktop, tablet, and mobile screen sizes
- [x] User can view and update profile information with instant feedback and toast notifications
- [x] Patient vs Admin dashboards show accurate role-specific widgets and menus

#### Status

- **Blocked until**: M2 Definition of Done is fully checked and verified

---

### M4: File Upload Pipeline

**Goal**: Implement secure medical record and lab report PDF file upload pipeline, PDF text parsing (`pdfjs`), and storage in Supabase Storage.

#### Checklist

- [x] Configure Supabase Storage bucket for medical documents with access control
- [x] Build drag-and-drop file upload component with progress bar and validation (file type, size limits)
- [x] Implement server API route (`app/api/files/upload/route.ts`) for document processing
- [x] Integrate `pdfjs` worker utility to parse text and extract metadata from uploaded medical PDFs
- [x] Save document metadata to `MedicalRecord` table via Prisma
- [x] Write reviewable Supabase RLS policies for storage bucket access in `supabase/policies/02_storage_rls.sql`

#### Definition of Done

- [x] Medical PDF documents can be uploaded, stored in Supabase Storage, and listed in UI
- [x] Text content is reliably extracted from PDF files using `pdfjs`
- [x] Upload errors (invalid format, oversized files) fail gracefully with Sonner toasts

#### Status

- **Blocked until**: M3 Definition of Done is fully checked and verified

---

### M5: Embeddings / RAG Chat

**Goal**: Build non-diagnostic context-aware medical AI assistant using OpenAI API (`text-embedding-3-small`), `pgvector` similarity search, and streaming RAG chat UI.

#### Checklist

- [x] Create document chunking and embedding generation service (`services/embeddingService.ts`) using OpenAI `text-embedding-3-small` via OpenRouter
- [x] Store chunk vector embeddings in `RecordEmbedding` table using `pgvector` with HNSW index (`supabase/migrations/003_pgvector_embeddings.sql`)
- [x] Implement vector similarity search with cosine distance in `services/embeddingService.ts` (`searchSimilarChunks`)
- [x] Build RAG conversational API endpoint (`app/api/chat/route.ts`) with streaming, conversation memory, context injection, and rate limiting (10 req/min/user)
- [x] Implement interactive chat UI component (`components/chat/ChatInterface.tsx`) with conversation list, streaming messages, suggestion chips, and medical disclaimer banner
- [x] Ensure non-diagnostic prompts and safety disclaimers are enforced in model system instructions
- [x] Auto-trigger embedding generation on file upload (`app/api/files/upload/route.ts`)

#### Definition of Done

- [x] Uploaded documents are automatically chunked, embedded, and stored in `pgvector`
- [x] AI assistant accurately answers questions based on user's uploaded medical records
- [x] Non-diagnostic medical disclaimers are displayed clearly on all chat responses

#### Status

- **Status**: Completed ✅

---

### M6: Vitals / Symptoms / Timeline

**Goal**: Implement health vitals tracking, symptom logging system, interactive Recharts visualizations, and unified health timeline.

#### Checklist

- [x] Create Vitals logging modal & form (`components/vitals/VitalsForm.tsx`) with Zod validation (Heart Rate, Blood Pressure, Temperature, Glucose, SpO2)
- [x] Create Symptom tracking log form (`components/symptoms/SymptomForm.tsx`) with Zod validation (Symptom name, severity 1-10, duration, notes)
- [x] Build visual health trend charts using Recharts (`components/vitals/VitalsChart.tsx`) for vitals over time with metric filters
- [x] Build unified chronological Health Timeline component (`components/timeline/TimelineFeed.tsx` & `/api/timeline`) combining vitals, symptoms, reports, and logs
- [x] Implement API routes (`/api/vitals`, `/api/symptoms`, `/api/timeline`) and TanStack Query integration across components & dashboard widgets

#### Definition of Done

- [x] Vitals and symptoms can be logged and deleted with Zod validation and immediate UI updates
- [x] Recharts graphs render accurately with responsive tooltips and metric filtering
- [x] Health Timeline accurately reflects user history in chronological order

#### Status

- **Status**: Completed ✅

---

### M7: Appointments / Notifications

**Goal**: Build appointment scheduling system, automated reminder notifications, email delivery via Resend, and toast alerts.

#### Checklist

- [x] Implement Appointment creation and management interface (`app/(dashboard)/appointments/page.tsx` & `components/appointments/AppointmentForm.tsx`)
- [x] Create Next.js API routes for appointment CRUD operations (`app/api/appointments/`, `app/api/appointments/[id]/`)
- [x] Build Notification engine for scheduling reminders & in-app alerts (`app/api/notifications/`, `app/api/notifications/read-all/`)
- [x] Integrate Resend email service (`services/emailService.ts`) for appointment confirmation emails
- [x] Create in-app Notification center drawer (`components/dashboard/NotificationDrawer.tsx`) with read/unread status management and badge in Topbar

#### Definition of Done

- [x] Patients can schedule, reschedule, and cancel appointments with Sonner toast feedback
- [x] Confirmation emails are dispatched via Resend API
- [x] In-app notification badge and panel reflect real-time reminder state

#### Status

- **Status**: Completed ✅

---

### M8: Admin / Settings

**Goal**: Develop administration dashboard, user management panel, audit log viewer, and global application configuration settings.

#### Checklist

- [x] Build Admin Dashboard overview with system statistics (Total users, active logs, storage usage) (`app/(dashboard)/admin/page.tsx`)
- [x] Create User Management table with role assignment, profile editing, and real activity metrics (`app/(dashboard)/admin/users/page.tsx` & `/api/admin/users`)
- [x] Create Audit Log viewer (`app/(dashboard)/admin/audit-logs/page.tsx` & `/api/admin/audit-logs`) tracking sensitive user and system events
- [x] Build User & System Settings page (`app/(dashboard)/settings/page.tsx` & `/api/settings`) (Theme settings, notification preferences, read-only role indicator)
- [x] Implement Strict Server-Side DB RBAC guard (`app/(dashboard)/admin/layout.tsx` server layout redirect + `/api/admin/*` DB role check + audit logging)
  - Removed all client-side self role assignment dropdowns
  - One-time SQL promotion script created (`supabase/promote_admin.sql`)

#### Definition of Done

- [x] Administrators can view application analytics, manage user roles, and inspect audit logs
- [x] Non-admin users attempting to access `/admin` routes are blocked and redirected at the server layout level
- [x] System settings changes persist accurately in database and user context

#### Status

- **Status**: Completed ✅

---

### M9: Hardening / Deploy

**Goal**: Perform security auditing, performance optimizations, end-to-end testing, Vercel build verification, and Supabase production deployment.

#### Checklist

- [x] Audit all API routes, inputs, and Zod schemas for sanitization and rate limiting
  - Created reusable `lib/security/rateLimit.ts` with preset profiles (AI, UPLOAD, EMBEDDING, STANDARD, AUTH, ADMIN)
  - Applied rate limiting to `/api/chat` (10 req/min), `/api/files/upload` (5 req/min), `/api/embeddings/generate` (5 req/min)
  - All mutating routes already use Zod validation; non-mutating read routes validated via auth + ownership checks
- [x] Consolidate all Supabase RLS policy `.sql` files in `supabase/production_rls.sql` for final manual review
  - RLS policies cover all 14 application tables with ownership-based access control
  - Admin-only access for `audit_logs` and user listing
- [x] Run full build check `npm run build` and resolve all lint, type, and bundle warnings
  - Build completes cleanly: 36 pages, 21 API routes, 0 errors
- [x] Test Vercel production build compatibility and environment variable mapping
  - Created `vercel.json` with security headers (X-Frame-Options, CSP, Referrer-Policy, Permissions-Policy)
  - Created `.env.example` with all 9 required environment variables documented
- [x] Finalize deployment documentation and run production smoke test
  - Created `.github/workflows/ci.yml` for automated lint + type-check + build on push/PR

#### Definition of Done

- [x] Production build compiles with zero errors or warnings
- [x] `production_rls.sql` is reviewed and ready for deployment
- [x] Application deployment artifacts ready (`vercel.json`, `.env.example`, CI pipeline)

#### Status

- **Status**: Completed ✅ (deploy pending manual trigger)

---

### Landing Page: Public Root Page ("/")

**Goal**: Build a high-converting, startup-grade public landing page at `/` reachable at `http://localhost:8080/`, featuring Hero section with Framer Motion animations, interactive product demo video slot, 6 real feature cards, SIH trust strip, and footer routing.

#### Checklist

- [x] Create Root Public Landing Page (`app/page.tsx`) with Framer Motion entrance animation, non-diagnostic value prop subhead, and CTAs ("Get Started" → `/register`, "Log In" → `/login`)
- [x] Build Product Demo Video component (`components/landing/DemoVideoPlaceholder.tsx`) with 16:9 aspect ratio, play overlay, poster controls, and `videoSrc="/demo-placeholder.mp4"` prop slot
- [x] Create 6 real feature highlight cards: Medical Report RAG Chat, Symptom Tracking, Health Timeline, Smart Vitals Analytics, Appointments & Notifications, Admin Audit & Security
- [x] Include Smart India Hackathon (SIH) trust strip, team badge, and explicit medical disclaimer banner
- [x] Build Footer with Logo, repeat CTA, and links to `/login` and `/register`
- [x] Configure `middleware.ts` to redirect authenticated users hitting `/` directly to `/dashboard`

#### Definition of Done

- [x] Landing page loads seamlessly at `/` with no auth requirements
- [x] Logged-in users hitting `/` are redirected to `/dashboard`
- [x] Video player embedded at `/` linked directly to `/Videos/Healthcare_AI_Prototype.mp4`
- [x] All CTA buttons route to real auth pages (`/register`, `/login`)

---

### Milestone: Complete Admin Monitoring Console

**Goal**: Build a complete, production-grade operations monitoring console under `/admin` with 8 real-data monitoring pages, strict server-side DB-driven RBAC guards (`role = 'ADMIN'`), audit logging for administrative state changes, and zero trace of admin controls in patient UI.

#### Checklist

- [x] Build central `services/adminService.ts` for real-time aggregate queries and audit-logged mutations across all 13 schema tables
- [x] Create server API endpoints (`/api/admin/files/`, `/api/admin/files/[id]`, `/api/admin/appointments/`, `/api/admin/appointments/[id]`, `/api/admin/vitals/`, `/api/admin/ai-sessions/`, `/api/admin/ai-sessions/[id]`, `/api/admin/notifications/`, `/api/admin/users/[id]`) with DB-driven `role = 'ADMIN'` checks
- [x] Page 1: System Overview (`/admin`) with 6 real aggregate stat cards matching live DB queries
- [x] Page 2: User Management (`/admin/users`) & User Activity Detail View (`/admin/users/[id]`)
- [x] Page 3: Medical Reports & PDF Storage Monitor (`/admin/files`) with text preview modal and deletion action + audit logging
- [x] Page 4: System Appointments Monitor (`/admin/appointments`) with status/date filters and admin cancellation + audit logging
- [x] Page 5: Patient Vitals & Symptoms Analytics (`/admin/vitals`) with clinical anomaly flags (SpO2 < 95%, HR > 100/< 50, Temp > 38°C)
- [x] Page 6: AI Chat Sessions & QA Monitor (`/admin/ai-sessions`) with read-only transcript viewer modal
- [x] Page 7: System Notifications & Email Dispatch Log (`/admin/notifications`)
- [x] Page 8: Security Audit Logs Viewer (`/admin/audit-logs`) with before/after state changes
- [x] Update `components/dashboard/Sidebar.tsx` to separate Patient Portal links from Admin Operations links with 100% patient isolation

#### Definition of Done

- [x] Non-admin users attempting to access any `/admin/*` route or `/api/admin/*` API endpoint get redirected or receive 403 HTTP response
- [x] Every count card on System Overview matches an exact live query against database tables
- [x] Admin state-changing actions (role reassignment, file deletion, appointment cancellation) automatically emit audit log entries to `audit_logs`
- [x] All 8 monitoring pages compile cleanly with zero TypeScript errors or mock data dependencies
- [x] All `/admin/*` routes wrapped in `app/(dashboard)/admin/layout.tsx` ensuring 100% theme, font, and Tailwind CSS consistency with the main application

> **Architectural Note for Future Admin Pages**: All new admin routes MUST be added within `app/(dashboard)/admin/` to automatically inherit the authenticated dashboard shell (`Sidebar`, `Navbar`, `styles/globals.css`, and `requireRole(['ADMIN'])` server guard). Never create an isolated `app/admin/` folder outside `(dashboard)`.

---

### Milestone: Collapsible Hover Sidebar UX

**Goal**: Implement a hover-to-expand, auto-collapse sidebar for both patient and admin routes, featuring smooth Framer Motion width/opacity animations, enter/exit delay buffers, custom tooltips, layout jump prevention, and coexistence with manual sidebar collapse toggles.

#### Checklist

- [x] Integrate `framer-motion` for smooth width and text element opacity transitions
- [x] Configure sidebar to default to collapsed state on page initialization
- [x] Set up enter/exit mouse event listeners with a 300ms delay to prevent accidental collapse
- [x] Style high-fidelity tooltips for icon-only navigation state
- [x] Protect layout structure to prevent main content reflow or shift during hover state updates
- [x] Ensure manual collapse toggle buttons take operational precedence over automatic hover behaviors

#### Definition of Done

- [x] Hovering cursor over the collapsed sidebar expands it smoothly within 200ms with ease-out transition
- [x] Cursor exit initiates a 300ms wait delay before collapsing to allow link navigation without layout loss
- [x] Collapsed sidebar shows beautiful tooltips next to each icon when hovered
- [x] Main content widgets, tables, and search headers do NOT reflow or shift positions when hover changes visual width
- [x] Manual toggle button state is strictly respected (persisted permanently to expand or collapse)

---

### Milestone: Security Hardening

**Goal**: Implement comprehensive healthcare security controls, including dual IP/user sliding-window rate limiting, AI conversation/token limits, server-side MIME & filename sanitization, security headers, CORS origin locks, production error sanitization, PII log protection, and automated dependency scanning.

#### Checklist

- [x] Upgrade `lib/security/rateLimit.ts` with IP & User tracking, standard profiles (`AUTH`, `AI`, `UPLOAD`, `ADMIN`, `STANDARD`, `GLOBAL_IP`), and Upstash Redis / sliding-window memory fallback
- [x] Implement global IP rate limiting and auth rate limiting in `middleware.ts` + per-IP & per-email limits in `lib/auth/actions.ts`
- [x] Enforce CORS origin verification locking on `/api/*` endpoints in `middleware.ts`
- [x] Cap AI chat sessions in `app/api/chat/route.ts` to 50 max messages per conversation, 1,500 max tokens per response, and verify parameterized RAG vector search filtering (`WHERE user_id = $2::uuid`)
- [x] Enforce server-side file MIME validation (`PDF`, `PNG`, `JPEG`, `WEBP`), 10MB size limit, and filename sanitization in `app/api/files/upload/route.ts`
- [x] Configure security headers in `next.config.ts` (`CSP`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `HSTS`, `Permissions-Policy`)
- [x] Create `lib/security/error.ts` to sanitize production 500 error responses and prevent stack trace leakage to the client
- [x] Audit codebase to confirm zero PII/PHI (medical report text, vitals values, user PII) is written to console logs
- [x] Create `.github/dependabot.yml` for automated npm dependency security auditing

#### Definition of Done

- [x] Rapid auth attempts (5 requests within 15 mins) trigger 429 Too Many Requests response with `Retry-After` header
- [x] AI chat endpoint enforces 10 req/min rate limit and 50 max messages per thread cap
- [x] Document vector similarity search executes strictly scoped to the authenticated user's ID
- [x] Security headers (`CSP`, `HSTS`, `X-Frame-Options`, `nosniff`) returned on all page/API responses
- [x] Production errors return clean, generic error messages without leaking stack traces or internal exception details

---

### Milestone: Supabase Migration Synchronization & Workflow Standard
**Goal**: Resolve migration drift between remote Supabase project history and local `supabase/migrations/` directory, update project configuration, and establish strict migration rules.

#### Checklist
- [x] Query remote Supabase `supabase_migrations.schema_migrations` table to inspect recorded migration history (`"00"` and `"003"`)
- [x] Update `supabase/config.toml` with actual remote project reference (`project_id = "wivyrgqskjicghndfomj"`)
- [x] Clean up local `supabase/migrations/` to keep exact matching migration files (`00_init_schema.sql` and `003_pgvector_embeddings.sql`) with safe, idempotent SQL
- [x] Update `AGENTS.md` standing guardrails: require all future schema/RLS changes to be created via `npx supabase migration new <name>` inside `supabase/migrations/` directly
- [x] Verify GitHub Actions CI Verification and Supabase Preview checks pass cleanly






