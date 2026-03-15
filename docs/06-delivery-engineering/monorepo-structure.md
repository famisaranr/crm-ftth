# Monorepo Structure & Scaffolding Plan
## FiberOps PH – FTTH Barangay Multi-JV CRM / OSS-BSS Platform

**Document ID**: MNR-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. Monorepo Stack

| Tool | Purpose | Version |
|------|---------|---------|
| **Turborepo** | Monorepo orchestration, task caching | Latest |
| **pnpm** | Package manager with workspace support | ≥ 8.x |
| **TypeScript** | Language for frontend and backend | 5.x |
| **NestJS** | Backend framework (modular monolith) | 10.x |
| **Next.js** | Frontend framework (App Router) | 14.x |
| **Prisma** | ORM and migration tool | 5.x |
| **Docker** | Containerization | Latest |

---

## 2. Root Directory Layout

```
crm_ftth/
├── .github/
│   └── workflows/
│       ├── ci.yml                # Lint + test + build on PR
│       ├── deploy-staging.yml    # Deploy to staging on merge to develop
│       └── deploy-production.yml # Deploy to production on tag
├── apps/
│   ├── api/                      # NestJS backend
│   └── web/                      # Next.js frontend
├── packages/
│   ├── shared-types/             # Shared TypeScript interfaces & DTOs
│   ├── shared-utils/             # Shared utility functions
│   ├── eslint-config/            # Shared ESLint configuration
│   └── tsconfig/                 # Shared TypeScript configs
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration files
│   └── seed.ts                   # Seed data script
├── docker/
│   ├── Dockerfile.api            # API production Dockerfile
│   ├── Dockerfile.web            # Web production Dockerfile
│   └── docker-compose.yml        # Local dev stack
├── docs/                         # Architecture documentation (this pack)
├── .env.example                  # Environment variable template
├── turbo.json                    # Turborepo pipeline config
├── pnpm-workspace.yaml           # Workspace definition
├── package.json                  # Root package.json
└── README.md                     # Project overview
```

---

## 3. Backend Structure (`apps/api/`)

```
apps/api/
├── src/
│   ├── main.ts                        # Entry point (NestJS + Fastify)
│   ├── app.module.ts                  # Root module
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── permissions.decorator.ts
│   │   │   └── barangay-scope.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── permission.guard.ts
│   │   │   └── barangay-scope.guard.ts
│   │   ├── interceptors/
│   │   │   ├── audit.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   ├── filters/
│   │   │   └── all-exceptions.filter.ts
│   │   ├── pipes/
│   │   │   └── zod-validation.pipe.ts
│   │   ├── middleware/
│   │   │   ├── correlation-id.middleware.ts
│   │   │   └── request-logger.middleware.ts
│   │   └── interfaces/
│   │       ├── paginated-response.ts
│   │       ├── api-response.ts
│   │       └── auth-user.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── refresh-token.dto.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   ├── barangays/
│   │   │   ├── barangays.module.ts
│   │   │   ├── barangays.controller.ts
│   │   │   ├── barangays.service.ts
│   │   │   └── dto/
│   │   ├── partners/
│   │   │   ├── partners.module.ts
│   │   │   ├── partners.controller.ts
│   │   │   ├── partners.service.ts
│   │   │   └── dto/
│   │   ├── plans/
│   │   │   ├── plans.module.ts
│   │   │   ├── plans.controller.ts
│   │   │   ├── plans.service.ts
│   │   │   └── dto/
│   │   ├── subscribers/
│   │   │   ├── subscribers.module.ts
│   │   │   ├── subscribers.controller.ts
│   │   │   ├── subscribers.service.ts
│   │   │   └── dto/
│   │   ├── network/
│   │   │   ├── network.module.ts
│   │   │   ├── assets.controller.ts
│   │   │   ├── assets.service.ts
│   │   │   ├── topology.service.ts
│   │   │   └── dto/
│   │   ├── installations/
│   │   │   ├── installations.module.ts
│   │   │   ├── installations.controller.ts
│   │   │   ├── installations.service.ts
│   │   │   └── dto/
│   │   ├── tickets/
│   │   │   ├── tickets.module.ts
│   │   │   ├── tickets.controller.ts
│   │   │   ├── tickets.service.ts
│   │   │   └── dto/
│   │   ├── billing/
│   │   │   ├── billing.module.ts
│   │   │   ├── invoices.controller.ts
│   │   │   ├── invoices.service.ts
│   │   │   ├── payments.controller.ts
│   │   │   ├── payments.service.ts
│   │   │   ├── billing-cycle.service.ts
│   │   │   ├── suspension.service.ts
│   │   │   ├── ledger.service.ts
│   │   │   └── dto/
│   │   ├── settlements/
│   │   │   ├── settlements.module.ts
│   │   │   ├── settlements.controller.ts
│   │   │   ├── settlements.service.ts
│   │   │   ├── calculator.service.ts
│   │   │   └── dto/
│   │   ├── dashboards/
│   │   │   ├── dashboards.module.ts
│   │   │   ├── dashboards.controller.ts
│   │   │   └── dashboards.service.ts
│   │   ├── audit/
│   │   │   ├── audit.module.ts
│   │   │   ├── audit.controller.ts
│   │   │   └── audit.service.ts
│   │   └── settings/
│   │       ├── settings.module.ts
│   │       ├── settings.controller.ts
│   │       └── settings.service.ts
│   ├── database/
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   └── jobs/
│       ├── jobs.module.ts
│       ├── billing-cycle.processor.ts
│       ├── suspension-check.processor.ts
│       ├── invoice-generator.processor.ts
│       └── notification.processor.ts
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

---

## 4. Frontend Structure (`apps/web/`)

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Root layout (providers, font, theme)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/[token]/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                 # Sidebar + topbar shell
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx               # Corporate dashboard
│   │   │   │   ├── barangay/[id]/page.tsx
│   │   │   │   ├── finance/page.tsx
│   │   │   │   └── network/page.tsx
│   │   │   ├── subscribers/
│   │   │   │   ├── page.tsx               # List
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx           # Detail (tabs)
│   │   │   │       └── edit/page.tsx
│   │   │   ├── network/
│   │   │   │   ├── assets/page.tsx
│   │   │   │   ├── assets/[id]/page.tsx
│   │   │   │   └── topology/page.tsx
│   │   │   ├── installations/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── tickets/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── dispatch/page.tsx
│   │   │   ├── billing/
│   │   │   │   ├── cycles/page.tsx
│   │   │   │   ├── invoices/page.tsx
│   │   │   │   ├── invoices/[id]/page.tsx
│   │   │   │   ├── payments/page.tsx
│   │   │   │   ├── payments/new/page.tsx
│   │   │   │   ├── aging/page.tsx
│   │   │   │   └── suspensions/page.tsx
│   │   │   ├── settlements/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── admin/
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── roles/page.tsx
│   │   │   │   ├── settings/page.tsx
│   │   │   │   └── audit-logs/page.tsx
│   │   │   └── settings/
│   │   │       ├── profile/page.tsx
│   │   │       └── password/page.tsx
│   ├── components/
│   │   ├── ui/                            # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   ├── bottom-nav.tsx
│   │   │   └── breadcrumbs.tsx
│   │   ├── data-table/
│   │   │   ├── data-table.tsx
│   │   │   ├── data-table-toolbar.tsx
│   │   │   ├── data-table-pagination.tsx
│   │   │   └── data-table-column-header.tsx
│   │   ├── forms/
│   │   │   ├── subscriber-form.tsx
│   │   │   ├── payment-form.tsx
│   │   │   ├── ticket-form.tsx
│   │   │   └── agreement-form.tsx
│   │   └── shared/
│   │       ├── status-badge.tsx
│   │       ├── stat-card.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── currency-input.tsx
│   │       ├── phone-input.tsx
│   │       └── empty-state.tsx
│   ├── lib/
│   │   ├── api-client.ts                  # Axios/fetch wrapper
│   │   ├── auth.ts                        # Auth utilities
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-permissions.ts
│   │   │   └── use-barangay-scope.ts
│   │   ├── validations/                   # Zod schemas
│   │   └── utils/
│   └── styles/
│       └── globals.css
├── public/
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 5. Shared Packages

### `packages/shared-types/`
```typescript
// Shared interfaces and DTOs used by both api and web
export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

// All entity types, enums, and DTOs shared between frontend and backend
export * from './enums';
export * from './entities';
export * from './dto';
```

### `packages/shared-utils/`
```typescript
// Shared utilities: formatters, validators, constants
export { formatCurrency } from './formatters';
export { formatDate, formatRelative } from './date';
export { generateAccountNumber } from './generators';
export { PH_PHONE_REGEX, EMAIL_REGEX } from './validators';
```

---

## 6. Configuration Files

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "test:e2e": {
      "dependsOn": ["build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "db:migrate": {},
    "db:seed": {}
  }
}
```

### `pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### `docker/docker-compose.yml` (Local Dev)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    ports: ['5432:5432']
    environment:
      POSTGRES_DB: fiberops
      POSTGRES_USER: fiberops
      POSTGRES_PASSWORD: fiberops_dev
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

  mailhog:
    image: mailhog/mailhog
    ports: ['1025:1025', '8025:8025']

volumes:
  pgdata:
```

---

## 7. Environment Variables

```dotenv
# Database
DATABASE_URL=postgresql://fiberops:fiberops_dev@localhost:5432/fiberops

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Auth
JWT_SECRET=your-secret-key-change-me
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# App
API_PORT=3001
WEB_PORT=3000
NODE_ENV=development

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```
