import { Controller, Get, Post, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('portal')
@UseGuards(JwtAuthGuard)
export class SubscriberPortalController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  async getProfile(@Req() req: Request) {
    const user = req.user as any;
    if (user.role !== 'SUBSCRIBER') {
      throw new UnauthorizedException('Only subscribers can access the portal');
    }

    const subscriber = await this.prisma.subscriber.findUnique({
      where: { id: user.sub || user.id }, // Token sub is the subscriber ID
      include: {
        address: true,
        subscriptions: {
          include: { plan: true },
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!subscriber) throw new UnauthorizedException('Subscriber not found');

    return subscriber;
  }

  @Get('tickets')
  async getTickets(@Req() req: Request) {
    const user = req.user as any;
    if (user.role !== 'SUBSCRIBER') {
      throw new UnauthorizedException('Only subscribers can access the portal');
    }

    return this.prisma.serviceTicket.findMany({
      where: { subscriber_id: user.sub || user.id },
      orderBy: { created_at: 'desc' },
    });
  }

  @Post('tickets')
  async createTicket(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    if (user.role !== 'SUBSCRIBER') {
      throw new UnauthorizedException('Only subscribers can access the portal');
    }

    const subscriber = await this.prisma.subscriber.findUnique({
      where: { id: user.sub || user.id },
      select: { barangay_id: true },
    });

    if (!subscriber) throw new UnauthorizedException('Subscriber not found');

    // Simple automatic ticket numbering (Phase 1.5 logic)
    const count = await this.prisma.serviceTicket.count();
    const ticketNumber = `TKT-${new Date().getFullYear()}${(count + 1).toString().padStart(5, '0')}`;

    return this.prisma.serviceTicket.create({
      data: {
        ticket_number: ticketNumber,
        subscriber_id: user.sub || user.id,
        barangay_id: subscriber.barangay_id,
        category: body.category || 'OTHER',
        subject: body.subject,
        description: body.description,
        status: 'OPEN',
        priority: 'P3_MEDIUM',
      },
    });
  }
}
