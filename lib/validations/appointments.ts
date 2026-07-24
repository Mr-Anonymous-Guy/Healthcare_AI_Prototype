import { z } from 'zod';

export const appointmentSchema = z.object({
  doctorName: z.string().min(1, 'Doctor name is required').max(100, 'Max 100 characters'),
  department: z.string().max(100, 'Max 100 characters').optional().nullable(),
  appointmentDate: z.string().min(1, 'Appointment date and time are required'),
  notes: z.string().max(1000, 'Max 1000 characters').optional().nullable(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
