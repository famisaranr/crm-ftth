import { z } from 'zod';

export const createSubscriberSchema = z.object({
  full_name: z.string().min(1).max(255),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  barangay_id: z.string().uuid(),
  billing_class: z.string().max(50).optional(),
  kyc_id_type: z.string().max(50).optional(),
  kyc_id_number: z.string().max(100).optional(),
  notes: z.string().optional(),
  address: z.object({
    address_line: z.string().min(1).max(500),
    purok_sitio: z.string().max(255).optional(),
    barangay_name: z.string().max(255).optional(),
    municipality: z.string().max(255).optional(),
    province: z.string().max(255).optional(),
    geotag_lat: z.number().optional(),
    geotag_lng: z.number().optional(),
  }).optional(),
});

export const updateSubscriberSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  billing_class: z.string().max(50).optional(),
  kyc_id_type: z.string().max(50).optional(),
  kyc_id_number: z.string().max(100).optional(),
  notes: z.string().optional(),
  address: z.object({
    address_line: z.string().min(1).max(500),
    purok_sitio: z.string().max(255).optional(),
    barangay_name: z.string().max(255).optional(),
    municipality: z.string().max(255).optional(),
    province: z.string().max(255).optional(),
    geotag_lat: z.number().optional(),
    geotag_lng: z.number().optional(),
  }).optional(),
});

export const changeStatusSchema = z.object({
  status: z.enum([
    'PROSPECT', 'SURVEYED', 'INSTALLATION_READY', 'ACTIVE',
    'SUSPENDED_SOFT', 'SUSPENDED_HARD', 'DISCONNECTED', 'CHURNED',
  ]),
  reason: z.string().optional(),
});

export type CreateSubscriberDto = z.infer<typeof createSubscriberSchema>;
export type UpdateSubscriberDto = z.infer<typeof updateSubscriberSchema>;
export type ChangeStatusDto = z.infer<typeof changeStatusSchema>;
