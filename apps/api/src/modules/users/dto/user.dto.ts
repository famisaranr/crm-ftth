import { z } from 'zod';

export const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    full_name: z.string().min(2),
    phone: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).default('PENDING'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial().omit({ password: true });
export type UpdateUserDto = z.infer<typeof updateUserSchema>;

export const assignRolesSchema = z.object({
    roleIds: z.array(z.string().uuid()),
});
export type AssignRolesDto = z.infer<typeof assignRolesSchema>;

export const assignScopesSchema = z.object({
    barangayIds: z.array(z.string().uuid()).optional(),
    partnerId: z.string().uuid().optional(),
});
export type AssignScopesDto = z.infer<typeof assignScopesSchema>;
