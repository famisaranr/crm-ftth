import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import type { ApiResponse } from '../interfaces/api-response';

/**
 * Interceptor that wraps all successful responses in the standard
 * { success: true, data: ... } format per the API contracts spec.
 *
 * Paginated responses that already have a `meta` property are
 * passed through with success: true added.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If response already has success/meta (e.g., paginated), pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // If response has meta (paginated), wrap appropriately
        if (data && typeof data === 'object' && 'meta' in data) {
          return {
            success: true,
            ...data,
          };
        }

        return {
          success: true,
          data,
        };
      }),
    );
  }
}
