import { SetMetadata } from '@nestjs/common';

export const BARANGAY_SCOPE_KEY = 'barangay_scope';

/**
 * Marks a route as requiring barangay scope enforcement.
 * The BarangayScopeGuard will read the barangay_id from request
 * params or body and verify the user has access.
 *
 * @param paramKey - The key in request params/body containing the barangay_id.
 *                   Defaults to 'barangay_id'.
 */
export const BarangayScope = (paramKey = 'barangay_id') =>
  SetMetadata(BARANGAY_SCOPE_KEY, paramKey);
