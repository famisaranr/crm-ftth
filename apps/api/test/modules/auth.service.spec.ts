import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/modules/auth/auth.service';
import { PrismaService } from '../../src/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createMockPrismaService } from '../helpers/mock-prisma';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
    let service: AuthService;
    let prisma: ReturnType<typeof createMockPrismaService>;
    let jwtService: { sign: jest.Mock; verify: jest.Mock };

    beforeEach(async () => {
        prisma = createMockPrismaService();
        jwtService = { sign: jest.fn().mockReturnValue('test-token'), verify: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: prisma },
                { provide: JwtService, useValue: jwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    describe('login', () => {
        it('should return JWT token for valid credentials', async () => {
            const hashedPassword = await bcrypt.hash('P@ssword1', 10);
            (prisma.user as any).findUnique.mockResolvedValue({
                id: 'user-1',
                email: 'admin@fiberops.ph',
                full_name: 'Admin User',
                password_hash: hashedPassword,
                status: 'ACTIVE',
                user_roles: [{ role: { id: 'role-1', name: 'Corp Admin' } }],
                user_scopes: [{ barangay_id: 'brgy-1' }],
                failed_login_count: 0,
                locked_until: null,
            });
            (prisma.user as any).update.mockResolvedValue({});
            (prisma.session as any).create.mockResolvedValue({ id: 'session-1' });
            (prisma.auditLog as any).create.mockResolvedValue({});

            const result = await service.login(
                { email: 'admin@fiberops.ph', password: 'P@ssword1' },
                '127.0.0.1',
                'Jest',
            );

            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe('admin@fiberops.ph');
            expect(jwtService.sign).toHaveBeenCalled();
        });

        it('should reject invalid email', async () => {
            (prisma.user as any).findUnique.mockResolvedValue(null);
            (prisma.auditLog as any).create.mockResolvedValue({});

            await expect(
                service.login(
                    { email: 'unknown@fiberops.ph', password: 'P@ssword1' },
                    '127.0.0.1',
                    'Jest',
                ),
            ).rejects.toThrow('Invalid credentials');
        });

        it('should reject wrong password', async () => {
            const hashedPassword = await bcrypt.hash('CorrectPass1', 10);
            (prisma.user as any).findUnique.mockResolvedValue({
                id: 'user-1',
                email: 'admin@fiberops.ph',
                password_hash: hashedPassword,
                status: 'ACTIVE',
                user_roles: [],
                user_scopes: [],
                failed_login_count: 0,
                locked_until: null,
            });
            (prisma.user as any).update.mockResolvedValue({});
            (prisma.auditLog as any).create.mockResolvedValue({});

            await expect(
                service.login(
                    { email: 'admin@fiberops.ph', password: 'WrongPass1' },
                    '127.0.0.1',
                    'Jest',
                ),
            ).rejects.toThrow('Invalid credentials');
        });

        it('should reject locked accounts', async () => {
            (prisma.user as any).findUnique.mockResolvedValue({
                id: 'user-1',
                email: 'admin@fiberops.ph',
                password_hash: 'hashed',
                status: 'ACTIVE',
                user_roles: [],
                user_scopes: [],
                failed_login_count: 5,
                locked_until: new Date(Date.now() + 30 * 60 * 1000),
            });

            await expect(
                service.login(
                    { email: 'admin@fiberops.ph', password: 'P@ssword1' },
                    '127.0.0.1',
                    'Jest',
                ),
            ).rejects.toThrow('Account is temporarily locked');
        });
    });
});
