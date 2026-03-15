import { z } from 'zod';

export const createAgreementSchema = z.object({
    partner_id: z.string().uuid(),
    barangay_id: z.string().uuid(),
    agreement_number: z.string().min(3),
    effective_date: z.string().transform(d => new Date(d)),
    end_date: z.string().optional().transform(d => d ? new Date(d) : undefined),
    status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED']).default('DRAFT'),
    notes: z.string().optional(),
    revenue_share_rules: z.array(z.object({
        share_type: z.enum(['GROSS', 'NET']),
        partner_percentage: z.number().min(0).max(100),
        deduction_buckets: z.any().optional(),
        description: z.string().optional()
    })).min(1)
});

export type CreateAgreementDto = z.infer<typeof createAgreementSchema>;

export const updateAgreementStatusSchema = z.object({
    status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED'])
});
export type UpdateAgreementStatusDto = z.infer<typeof updateAgreementStatusSchema>;
