import { z } from 'zod';

export const symptomSchema = z.object({
  symptomName: z.string().min(1, 'Symptom name is required').max(100, 'Max 100 characters'),
  severity: z.coerce.number().int().min(1, 'Severity minimum is 1').max(10, 'Severity maximum is 10'),
  duration: z.string().max(100, 'Max 100 characters').optional().nullable(),
  notes: z.string().max(1000, 'Max 1000 characters').optional().nullable(),
  loggedAt: z.string().optional(),
});

export type SymptomInput = z.infer<typeof symptomSchema>;
