import { z } from 'zod';

export const createPlanFeatureSchema = z.object({
    feature_name: z.string().min(2),
    feature_value: z.string().min(1)
});

export const createPromoSchema = z.object({
    name: z.string().min(2),
    discount_amount: z.number().optional(),
    discount_percentage: z.number().min(0).max(100).optional(),
    duration_months: z.number().int().optional(),
    valid_from: z.string().transform(d => new Date(d)),
    valid_to: z.string().optional().transform(d => d ? new Date(d) : undefined),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE')
}).refine(data => data.discount_amount != null || data.discount_percentage != null, {
    message: "Either discount_amount or discount_percentage must be provided",
    path: ["discount_amount"]
});

export const createPlanSchema = z.object({
    name: z.string().min(2),
    speed_mbps: z.number().int().min(1),
    monthly_fee: z.number().min(0),
    installation_fee: z.number().min(0).default(0),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DEPRECATED']).default('ACTIVE'),
    description: z.string().optional(),
    plan_features: z.array(createPlanFeatureSchema).optional(),
    promos: z.array(createPromoSchema).optional()
});

export type CreatePlanDto = z.infer<typeof createPlanSchema>;

export type CreatePromoDto = z.infer<typeof createPromoSchema>;

export const updatePlanSchema = createPlanSchema.partial();
export type UpdatePlanDto = z.infer<typeof updatePlanSchema>;
