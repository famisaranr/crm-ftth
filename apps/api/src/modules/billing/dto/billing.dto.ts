import { z } from 'zod';

export const createBillingCycleSchema = z.object({
    barangay_id: z.string().uuid(),
    period_start: z.string().min(1),
    period_end: z.string().min(1),
});

export const generateInvoicesSchema = z.object({
    due_date: z.string().optional(),
});

export const voidInvoiceSchema = z.object({
    reason: z.string().min(1),
});

export const adjustInvoiceSchema = z.object({
    type: z.enum(['CREDIT', 'DEBIT']),
    amount: z.number().positive(),
    reason: z.string().min(1),
});

export const applyPenaltiesSchema = z.object({
    barangay_id: z.string().uuid().optional(),
});

export type CreateBillingCycleDto = z.infer<typeof createBillingCycleSchema>;
export type GenerateInvoicesDto = z.infer<typeof generateInvoicesSchema>;
export type VoidInvoiceDto = z.infer<typeof voidInvoiceSchema>;
export type AdjustInvoiceDto = z.infer<typeof adjustInvoiceSchema>;
export type ApplyPenaltiesDto = z.infer<typeof applyPenaltiesSchema>;
