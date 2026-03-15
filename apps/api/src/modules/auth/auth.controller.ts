import {
  Controller, Post, Patch, Body, Req, UseGuards,
  HttpCode, HttpStatus, UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginSchema, type LoginDto } from './dto/login.dto';
import {
  changePasswordSchema, type ChangePasswordDto,
  forgotPasswordSchema, type ForgotPasswordDto,
  resetPasswordSchema, type ResetPasswordDto,
} from './dto/auth.dto';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/interfaces/auth-user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   * Public — no auth required
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.authService.login(loginDto, ip, userAgent);
  }

  /**
   * POST /api/v1/auth/refresh
   * Public — uses refresh token from body
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body('refresh_token') refreshToken: string,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return this.authService.refreshToken(refreshToken, ip);
  }

  /**
   * POST /api/v1/auth/logout
   * Requires authentication
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: AuthUser, @Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return this.authService.logout(user.id, ip);
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Public — no auth required
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return this.authService.forgotPassword(dto, ip);
  }

  /**
   * POST /api/v1/auth/reset-password
   * Public — uses reset token from body
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return this.authService.resetPassword(dto, ip);
  }

  /**
   * PATCH /api/v1/auth/change-password
   * Requires authentication
   */
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(changePasswordSchema))
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return this.authService.changePassword(user.id, dto, ip);
  }
}
