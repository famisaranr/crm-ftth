# CI/CD Pipeline
## FiberOps PH – Continuous Integration & Deployment

**Document ID**: CIC-FOPS-001
**Version**: 1.0
**Date**: 2026-03-07

---

## 1. Pipeline Overview

```mermaid
graph LR
    subgraph "CI Pipeline (PR)"
        A["Push / PR"] --> B["Install deps"]
        B --> C["Lint"]
        C --> D["Type check"]
        D --> E["Unit tests"]
        E --> F["Build"]
        F --> G["Integration tests"]
    end

    subgraph "CD Pipeline (merge to develop)"
        H["Merge"] --> I["Build Docker images"]
        I --> J["Push to registry"]
        J --> K["Deploy to Staging"]
        K --> L["Run E2E tests"]
        L --> M["Smoke tests"]
    end

    subgraph "Release (tagged)"
        N["Tag v*.*.*"] --> O["Build prod images"]
        O --> P["Push to registry"]
        P --> Q["Deploy to Production"]
        Q --> R["Health checks"]
        R --> S["Notify team"]
    end
```

---

## 2. CI Pipeline (`.github/workflows/ci.yml`)

```yaml
name: CI Pipeline
on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint
      - run: pnpm turbo typecheck

  unit-tests:
    needs: lint-and-typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo test -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: '**/coverage/'

  build:
    needs: unit-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo build

  integration-tests:
    needs: build
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        ports: ['5432:5432']
        env:
          POSTGRES_DB: fiberops_test
          POSTGRES_USER: fiberops
          POSTGRES_PASSWORD: test_password
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 8 }
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo build
      - name: Run migrations
        run: cd apps/api && npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://fiberops:test_password@localhost:5432/fiberops_test
      - name: Run integration tests
        run: pnpm --filter api test:integration
        env:
          DATABASE_URL: postgresql://fiberops:test_password@localhost:5432/fiberops_test
          REDIS_HOST: localhost
```

---

## 3. CD Pipeline (`.github/workflows/deploy-staging.yml`)

```yaml
name: Deploy Staging
on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Build API Docker image
        run: |
          docker build -f docker/Dockerfile.api \
            -t ${{ secrets.REGISTRY }}/fiberops-api:staging-${{ github.sha }} .

      - name: Build Web Docker image
        run: |
          docker build -f docker/Dockerfile.web \
            -t ${{ secrets.REGISTRY }}/fiberops-web:staging-${{ github.sha }} .

      - name: Push images
        run: |
          echo "${{ secrets.REGISTRY_PASSWORD }}" | docker login -u ${{ secrets.REGISTRY_USER }} --password-stdin ${{ secrets.REGISTRY }}
          docker push ${{ secrets.REGISTRY }}/fiberops-api:staging-${{ github.sha }}
          docker push ${{ secrets.REGISTRY }}/fiberops-web:staging-${{ github.sha }}

      - name: Deploy to staging
        run: |
          # SSH or cloud CLI to update staging deployment
          # Example: docker compose -f docker-compose.staging.yml up -d

      - name: Run database migrations
        run: |
          # Execute migration on staging database

      - name: Health check
        run: |
          for i in {1..30}; do
            curl -f ${{ secrets.STAGING_URL }}/api/v1/health && exit 0 || sleep 5
          done
          exit 1

      - name: Run E2E tests
        run: pnpm --filter api test:e2e
        env:
          API_URL: ${{ secrets.STAGING_URL }}
```

---

## 4. Production Release (`.github/workflows/deploy-production.yml`)

```yaml
name: Deploy Production
on:
  push:
    tags: ['v*.*.*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Extract version
        run: echo "VERSION=${GITHUB_REF#refs/tags/}" >> $GITHUB_ENV

      - name: Build & push production images
        run: |
          docker build -f docker/Dockerfile.api \
            -t ${{ secrets.REGISTRY }}/fiberops-api:${{ env.VERSION }} \
            -t ${{ secrets.REGISTRY }}/fiberops-api:latest .
          docker build -f docker/Dockerfile.web \
            -t ${{ secrets.REGISTRY }}/fiberops-web:${{ env.VERSION }} \
            -t ${{ secrets.REGISTRY }}/fiberops-web:latest .
          docker push --all-tags ${{ secrets.REGISTRY }}/fiberops-api
          docker push --all-tags ${{ secrets.REGISTRY }}/fiberops-web

      - name: Deploy to production
        run: |
          # Production deployment script

      - name: Run migrations
        run: |
          # Execute migration on production database

      - name: Health check
        run: |
          curl -f ${{ secrets.PROD_URL }}/api/v1/health

      - name: Notify team
        run: |
          echo "🚀 FiberOps PH ${{ env.VERSION }} deployed to production"
```

---

## 5. Branch Strategy

```mermaid
gitgraph
    commit id: "initial"
    branch develop
    checkout develop
    commit id: "feature-start"
    branch feature/subscribers
    checkout feature/subscribers
    commit id: "subscriber-crud"
    commit id: "subscriber-tests"
    checkout develop
    merge feature/subscribers id: "PR merge"
    commit id: "deploy-staging" tag: "staging"
    checkout main
    merge develop id: "release" tag: "v1.0.0"
```

| Branch | Purpose | Deploys To |
|--------|---------|-----------|
| `main` | Production-ready code | Production (on tag) |
| `develop` | Integration branch | Staging (on push) |
| `feature/*` | Feature development | — (PR to develop) |
| `fix/*` | Bug fixes | — (PR to develop) |
| `hotfix/*` | Critical production fixes | PR to main + develop |

---

## 6. Quality Gates

| Gate | Threshold | Blocking |
|------|-----------|:--------:|
| ESLint | 0 errors | ✅ |
| TypeScript | 0 type errors | ✅ |
| Unit test pass rate | 100% | ✅ |
| Unit test coverage | ≥ 80% | ✅ |
| Integration test pass rate | 100% | ✅ |
| Build successful | All apps build | ✅ |
| E2E tests (staging) | 100% | ✅ (for prod) |
| PR review approval | ≥ 1 reviewer | ✅ |
