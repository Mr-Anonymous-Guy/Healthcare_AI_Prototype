import { z } from 'zod';

export const vitalSchema = z
  .object({
    heartRate: z.coerce.number().int().min(30, 'Min 30 bpm').max(250, 'Max 250 bpm').optional().nullable(),
    bloodPressureSystolic: z.coerce.number().int().min(50, 'Min 50 mmHg').max(250, 'Max 250 mmHg').optional().nullable(),
    bloodPressureDiastolic: z.coerce.number().int().min(30, 'Min 30 mmHg').max(180, 'Max 180 mmHg').optional().nullable(),
    temperature: z.coerce.number().min(85, 'Min 85°F').max(115, 'Max 115°F').optional().nullable(),
    glucose: z.coerce.number().min(20, 'Min 20 mg/dL').max(600, 'Max 600 mg/dL').optional().nullable(),
    spO2: z.coerce.number().min(50, 'Min 50%').max(100, 'Max 100%').optional().nullable(),
    recordedAt: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.heartRate !== undefined && data.heartRate !== null && !isNaN(data.heartRate)) ||
      (data.bloodPressureSystolic !== undefined && data.bloodPressureSystolic !== null && !isNaN(data.bloodPressureSystolic)) ||
      (data.bloodPressureDiastolic !== undefined && data.bloodPressureDiastolic !== null && !isNaN(data.bloodPressureDiastolic)) ||
      (data.temperature !== undefined && data.temperature !== null && !isNaN(data.temperature)) ||
      (data.glucose !== undefined && data.glucose !== null && !isNaN(data.glucose)) ||
      (data.spO2 !== undefined && data.spO2 !== null && !isNaN(data.spO2)),
    {
      message: 'Please provide at least one vital sign value.',
    }
  );

export type VitalInput = z.infer<typeof vitalSchema>;
