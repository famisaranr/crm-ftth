import { z } from 'zod';

export const createPartnerSchema = z.object({
    company_name: z.string().min(2),
    contact_person: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type CreatePartnerDto = z.infer<typeof createPartnerSchema>;

export const updatePartnerSchema = createPartnerSchema.partial();
export type UpdatePartnerDto = z.infer<typeof updatePartnerSchema>;
