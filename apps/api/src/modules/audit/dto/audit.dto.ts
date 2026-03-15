import { z } from 'zod';

export const queryAuditLogsSchema = z.object({
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
  actor_id: z.string().uuid().optional(),
  action: z
    .enum(['CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'LOGIN', 'LOGIN_FAILED', 'EXPORT', 'APPROVAL'])
    .optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type QueryAuditLogsDto = z.infer<typeof queryAuditLogsSchema>;
