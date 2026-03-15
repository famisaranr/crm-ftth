import { z } from 'zod';

export const assignTechnicianSchema = z.object({
    technician_id: z.string().uuid(),
    scheduled_date: z.string().optional(),
    notes: z.string().optional(),
});

export const updateInstallationStatusSchema = z.object({
    status: z.enum([
        'LEAD_CREATED', 'SURVEY_SCHEDULED', 'SURVEY_COMPLETED',
        'FEASIBLE', 'NOT_FEASIBLE', 'INSTALL_SCHEDULED',
        'INSTALLED', 'ACTIVATED', 'QA_VERIFIED', 'BILLING_STARTED',
        'FAILED', 'RESCHEDULED', 'CANCELLED',
    ]),
    failure_reason: z.string().optional(),
    reschedule_reason: z.string().optional(),
    notes: z.string().optional(),
});

export const activateConnectionSchema = z.object({
    activation_date: z.string().optional(),
    notes: z.string().optional(),
});

export const uploadPhotoSchema = z.object({
    file_url: z.string().url().max(500),
    caption: z.string().max(255).optional(),
    phase: z.string().max(50),
});

export type AssignTechnicianDto = z.infer<typeof assignTechnicianSchema>;
export type UpdateInstallationStatusDto = z.infer<typeof updateInstallationStatusSchema>;
export type ActivateConnectionDto = z.infer<typeof activateConnectionSchema>;
export type UploadPhotoDto = z.infer<typeof uploadPhotoSchema>;
