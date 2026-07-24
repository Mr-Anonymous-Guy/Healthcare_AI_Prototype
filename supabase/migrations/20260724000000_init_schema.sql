-- Initial Migration SQL for HealthAI Prototype
-- Safe & Idempotent Migration: Checks existence before creating types, tables, or indexes.

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum Safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'ADMIN', 'DOCTOR');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReportStatus') THEN
        CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AppointmentStatus') THEN
        CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MessageRole') THEN
        CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
        CREATE TYPE "NotificationType" AS ENUM ('INFO', 'APPOINTMENT_REMINDER', 'VITALS_ALERT', 'SYSTEM');
    END IF;
END $$;

-- CreateTable users
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PATIENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable profiles
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "full_name" TEXT,
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "blood_type" TEXT,
    "emergency_contact" TEXT,
    "medical_history" TEXT,
    "allergies" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable medical_reports
CREATE TABLE IF NOT EXISTS "medical_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "file_id" UUID,
    "title" TEXT NOT NULL,
    "report_type" TEXT,
    "report_date" TIMESTAMP(3),
    "summary" TEXT,
    "extracted_text" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable files
CREATE TABLE IF NOT EXISTS "files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_key" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "extracted_text" TEXT,
    "embedding" vector(1536),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable appointments
CREATE TABLE IF NOT EXISTS "appointments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "doctor_name" TEXT NOT NULL,
    "department" TEXT,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable symptoms
CREATE TABLE IF NOT EXISTS "symptoms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "symptom_name" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "duration" TEXT,
    "notes" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable vitals
CREATE TABLE IF NOT EXISTS "vitals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "heart_rate" INTEGER,
    "bp_systolic" INTEGER,
    "bp_diastolic" INTEGER,
    "temperature" DOUBLE PRECISION,
    "glucose" DOUBLE PRECISION,
    "spO2" DOUBLE PRECISION,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vitals_pkey" PRIMARY KEY ("id")
);

-- CreateTable health_logs
CREATE TABLE IF NOT EXISTS "health_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "log_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable ai_sessions
CREATE TABLE IF NOT EXISTS "ai_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "system_prompt" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable conversations
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "ai_session_id" UUID,
    "title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable messages
CREATE TABLE IF NOT EXISTS "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "sources" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable notifications
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "scheduled_for" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable audit_logs
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_user_id_key" ON "profiles"("user_id");
CREATE INDEX IF NOT EXISTS "profiles_user_id_idx" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "medical_reports_file_id_key" ON "medical_reports"("file_id");
CREATE INDEX IF NOT EXISTS "medical_reports_user_id_idx" ON "medical_reports"("user_id");
CREATE INDEX IF NOT EXISTS "medical_reports_report_date_idx" ON "medical_reports"("report_date");
CREATE INDEX IF NOT EXISTS "medical_reports_status_idx" ON "medical_reports"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "files_user_id_idx" ON "files"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "appointments_user_id_idx" ON "appointments"("user_id");
CREATE INDEX IF NOT EXISTS "appointments_appointment_date_idx" ON "appointments"("appointment_date");
CREATE INDEX IF NOT EXISTS "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "symptoms_user_id_idx" ON "symptoms"("user_id");
CREATE INDEX IF NOT EXISTS "symptoms_logged_at_idx" ON "symptoms"("logged_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "vitals_user_id_idx" ON "vitals"("user_id");
CREATE INDEX IF NOT EXISTS "vitals_recorded_at_idx" ON "vitals"("recorded_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "health_logs_user_id_idx" ON "health_logs"("user_id");
CREATE INDEX IF NOT EXISTS "health_logs_logged_at_idx" ON "health_logs"("logged_at");
CREATE INDEX IF NOT EXISTS "health_logs_log_type_idx" ON "health_logs"("log_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ai_sessions_user_id_idx" ON "ai_sessions"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "conversations_user_id_idx" ON "conversations"("user_id");
CREATE INDEX IF NOT EXISTS "conversations_ai_session_id_idx" ON "conversations"("ai_session_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "messages_conversation_id_idx" ON "messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications"("is_read");
CREATE INDEX IF NOT EXISTS "notifications_scheduled_for_idx" ON "notifications"("scheduled_for");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKeys Safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_fkey') THEN
        ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medical_reports_user_id_fkey') THEN
        ALTER TABLE "medical_reports" ADD CONSTRAINT "medical_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'medical_reports_file_id_fkey') THEN
        ALTER TABLE "medical_reports" ADD CONSTRAINT "medical_reports_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'files_user_id_fkey') THEN
        ALTER TABLE "files" ADD CONSTRAINT "files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_user_id_fkey') THEN
        ALTER TABLE "appointments" ADD CONSTRAINT "appointments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'symptoms_user_id_fkey') THEN
        ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vitals_user_id_fkey') THEN
        ALTER TABLE "vitals" ADD CONSTRAINT "vitals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'health_logs_user_id_fkey') THEN
        ALTER TABLE "health_logs" ADD CONSTRAINT "health_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ai_sessions_user_id_fkey') THEN
        ALTER TABLE "ai_sessions" ADD CONSTRAINT "ai_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_user_id_fkey') THEN
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_ai_session_id_fkey') THEN
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_ai_session_id_fkey" FOREIGN KEY ("ai_session_id") REFERENCES "ai_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_conversation_id_fkey') THEN
        ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_user_id_fkey') THEN
        ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_actor_id_fkey') THEN
        ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
