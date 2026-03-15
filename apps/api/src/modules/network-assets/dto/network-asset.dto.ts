import { z } from 'zod';

export const createNetworkAssetSchema = z.object({
    asset_type_id: z.string().uuid(),
    barangay_id: z.string().uuid(),
    parent_asset_id: z.string().uuid().optional(),
    serial_number: z.string().max(100).optional(),
    name: z.string().min(1).max(255),
    status: z.enum(['PLANNED', 'DEPLOYED', 'ACTIVE', 'MAINTENANCE', 'DECOMMISSIONED', 'FAULTY']).optional(),
    capacity: z.number().int().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    notes: z.string().optional(),
    // Type-specific metadata
    olt_port: z.object({
        port_number: z.number().int(),
        capacity: z.number().int().optional(),
    }).optional(),
    splitter: z.object({
        ratio: z.string().max(10),
        output_count: z.number().int(),
    }).optional(),
    distribution_box: z.object({
        capacity: z.number().int(),
        location: z.string().max(255).optional(),
    }).optional(),
    ont_device: z.object({
        mac_address: z.string().max(17).optional(),
        model: z.string().max(100).optional(),
        subscriber_id: z.string().uuid().optional(),
    }).optional(),
});

export const updateNetworkAssetSchema = z.object({
    serial_number: z.string().max(100).optional(),
    name: z.string().min(1).max(255).optional(),
    status: z.enum(['PLANNED', 'DEPLOYED', 'ACTIVE', 'MAINTENANCE', 'DECOMMISSIONED', 'FAULTY']).optional(),
    capacity: z.number().int().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    notes: z.string().optional(),
});

export type CreateNetworkAssetDto = z.infer<typeof createNetworkAssetSchema>;
export type UpdateNetworkAssetDto = z.infer<typeof updateNetworkAssetSchema>;
