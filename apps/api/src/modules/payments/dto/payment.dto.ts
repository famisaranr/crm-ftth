import { z } from 'zod';

export const postPaymentSchema = z.object({
    invoice_id: z.string().uuid().optional(),
    subscriber_id: z.string().uuid(),
    barangay_id: z.string().uuid(),
    amount: z.number().positive(),
    method: z.enum(['CASH', 'GCASH', 'BANK_TRANSFER', 'CHECK', 'ONLINE', 'OTHER']),
    receipt_reference: z.string().max(100).optional(),
    notes: z.string().optional(),
});

export const reversePaymentSchema = z.object({
    reason: z.string().min(1),
});

export type PostPaymentDto = z.infer<typeof postPaymentSchema>;
export type ReversePaymentDto = z.infer<typeof reversePaymentSchema>;
