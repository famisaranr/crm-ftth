import { z } from 'zod';

export const createSettlementSchema = z.object({
    agreement_id: z.string().uuid(),
    period_start: z.string(), // ISO date
    period_end: z.string(),
    notes: z.string().optional(),
});

export const submitSettlementSchema = z.object({
    notes: z.string().optional(),
});

export const approveSettlementSchema = z.object({
    notes: z.string().optional(),
});

export const disburseSettlementSchema = z.object({
    notes: z.string().optional(),
});

export const lockSettlementSchema = z.object({
    notes: z.string().optional(),
});

export type CreateSettlementDto = z.infer<typeof createSettlementSchema>;
export type SubmitSettlementDto = z.infer<typeof submitSettlementSchema>;
export type ApproveSettlementDto = z.infer<typeof approveSettlementSchema>;
export type DisburseSettlementDto = z.infer<typeof disburseSettlementSchema>;
export type LockSettlementDto = z.infer<typeof lockSettlementSchema>;
