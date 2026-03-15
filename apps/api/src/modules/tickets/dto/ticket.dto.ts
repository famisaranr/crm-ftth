import { z } from 'zod';

export const createTicketSchema = z.object({
    subscriber_id: z.string().uuid(),
    barangay_id: z.string().uuid(),
    category: z.enum([
        'NO_CONNECTION', 'INTERMITTENT', 'SLOW_INTERNET', 'LOS_RED_LIGHT',
        'FIBER_CUT', 'BILLING_ISSUE', 'RELOCATION', 'UPGRADE_DOWNGRADE',
        'ONT_REPLACEMENT', 'COMPLAINT', 'ESCALATION', 'OTHER',
    ]),
    priority: z.enum(['P1_CRITICAL', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW']).optional(),
    subject: z.string().min(1).max(255),
    description: z.string().optional(),
});

export const assignTicketSchema = z.object({
    assigned_to: z.string().uuid(),
    notes: z.string().optional(),
});

export const updateTicketStatusSchema = z.object({
    status: z.enum([
        'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_CUSTOMER',
        'RESOLVED', 'CLOSED', 'ESCALATED', 'REOPENED',
    ]),
    notes: z.string().optional(),
});

export const addNoteSchema = z.object({
    content: z.string().min(1),
    is_internal: z.boolean().optional(),
});

export type CreateTicketDto = z.infer<typeof createTicketSchema>;
export type AssignTicketDto = z.infer<typeof assignTicketSchema>;
export type UpdateTicketStatusDto = z.infer<typeof updateTicketStatusSchema>;
export type AddNoteDto = z.infer<typeof addNoteSchema>;
