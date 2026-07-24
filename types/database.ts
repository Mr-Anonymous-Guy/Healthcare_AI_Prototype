export type UserRole = 'PATIENT' | 'ADMIN' | 'DOCTOR';
export type ReportStatus = 'PENDING' | 'PROCESSED' | 'FAILED';
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';
export type NotificationType = 'INFO' | 'APPOINTMENT_REMINDER' | 'VITALS_ALERT' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  fullName?: string | null;
  phone?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  bloodType?: string | null;
  emergencyContact?: string | null;
  medicalHistory?: string | null;
  allergies?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalReport {
  id: string;
  userId: string;
  fileId?: string | null;
  title: string;
  reportType?: string | null;
  reportDate?: Date | null;
  summary?: string | null;
  extractedText?: string | null;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileRecord {
  id: string;
  userId: string;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  extractedText?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  userId: string;
  doctorName: string;
  department?: string | null;
  appointmentDate: Date;
  status: AppointmentStatus;
  notes?: string | null;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Symptom {
  id: string;
  userId: string;
  symptomName: string;
  severity: number;
  duration?: string | null;
  notes?: string | null;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vital {
  id: string;
  userId: string;
  heartRate?: number | null;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  temperature?: number | null;
  glucose?: number | null;
  spO2?: number | null;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthLog {
  id: string;
  userId: string;
  logType: string;
  title: string;
  content: string;
  loggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AISession {
  id: string;
  userId: string;
  model: string;
  systemPrompt?: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  aiSessionId?: string | null;
  title?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  sources?: Record<string, unknown> | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  scheduledFor?: Date | null;
  sentAt?: Date | null;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  action: string;
  resource: string;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: Date;
}
