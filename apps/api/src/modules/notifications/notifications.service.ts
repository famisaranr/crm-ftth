import { Injectable, Logger } from '@nestjs/common';

export interface NotificationPayload {
    type: string;
    recipient_id: string;
    title: string;
    body: string;
    metadata?: Record<string, unknown>;
}

/**
 * Notifications service — extensibility hook for future integrations.
 * Current implementation logs notifications; future phases can add:
 * - Email (via SMTP/Mailhog)
 * - SMS
 * - Push notifications
 * - In-app notifications with WebSocket
 */
@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    async send(payload: NotificationPayload): Promise<void> {
        this.logger.log(`[NOTIFICATION] ${payload.type} → ${payload.recipient_id}: ${payload.title}`);
        // Future: persist to DB, send via email/SMS/push
    }

    async sendBatch(payloads: NotificationPayload[]): Promise<void> {
        for (const payload of payloads) {
            await this.send(payload);
        }
    }
}
