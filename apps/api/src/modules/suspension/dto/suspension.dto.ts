import { z } from 'zod';

export const overrideSuspensionSchema = z.object({
    action: z.enum(['SKIP', 'FORCE_SUSPEND', 'REACTIVATE']),
    reason: z.string().min(1),
});

export type OverrideSuspensionDto = z.infer<typeof overrideSuspensionSchema>;
