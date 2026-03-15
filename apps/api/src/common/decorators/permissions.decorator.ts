import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to set required permissions for a route handler.
 * Usage: @Permissions('users.user.create', 'users.user.update')
 * The user must have ALL listed permissions to access the endpoint.
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
