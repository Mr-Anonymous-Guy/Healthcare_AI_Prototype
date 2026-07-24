import { z } from 'zod';

export const settingsSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  bloodType: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  emailNotifications: z.boolean().optional().default(true),
  appointmentReminders: z.boolean().optional().default(true),
  vitalAlerts: z.boolean().optional().default(true),
  theme: z.enum(['light', 'dark', 'system']).optional().default('light'),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
