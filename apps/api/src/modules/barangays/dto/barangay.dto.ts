import { z } from 'zod';

export const createBarangaySchema = z.object({
    name: z.string().min(2),
    municipality: z.string().min(2),
    province: z.string().min(2),
    region: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'ONBOARDING']).default('ONBOARDING'),
    latitude: z.number().optional(),
    longitude: z.number().optional()
});

export type CreateBarangayDto = z.infer<typeof createBarangaySchema>;

export const updateBarangaySchema = createBarangaySchema.partial();
export type UpdateBarangayDto = z.infer<typeof updateBarangaySchema>;
