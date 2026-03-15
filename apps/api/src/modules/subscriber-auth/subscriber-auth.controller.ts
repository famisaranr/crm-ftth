import { Controller, Post, Body, Req, HttpCode, HttpStatus, UsePipes } from '@nestjs/common';
import { SubscriberAuthService } from './subscriber-auth.service';
import { subscriberLoginSchema, type SubscriberLoginDto } from './dto/subscriber-login.dto';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('subscriber-auth')
export class SubscriberAuthController {
  constructor(private readonly authService: SubscriberAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(subscriberLoginSchema))
  async login(@Body() loginDto: SubscriberLoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.login(loginDto, ip, userAgent);
  }
}
