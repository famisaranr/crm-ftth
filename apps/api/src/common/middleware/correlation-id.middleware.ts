import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Middleware that assigns a unique correlation ID to each request.
 * The correlation ID is propagated in the X-Correlation-ID response header
 * and can be used for distributed tracing and log correlation.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorrelationIdMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || randomUUID();

    (req as unknown as Record<string, unknown>).correlationId = correlationId;
    _res.setHeader('X-Correlation-ID', correlationId);

    next();
  }
}
