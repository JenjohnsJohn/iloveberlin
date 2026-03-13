# ILoveBerlin

Digital lifestyle hub for Berlin - combining city media, event discovery, restaurant discovery, community storytelling, and local marketplace.

## Tech Stack

- **Frontend:** Next.js 15 (App Router)
- **Backend:** NestJS 11
- **Database:** PostgreSQL 16
- **Search:** Meilisearch
- **Cache:** Redis
- **Mobile:** Flutter (planned)

## Quick Start

### Prerequisites

- Node.js 22+
- pnpm 10+
- Docker & Docker Compose

### Setup

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start infrastructure services:
   ```bash
   docker compose up -d
   ```
4. Install dependencies:
   ```bash
   pnpm install
   ```
5. Start development servers:
   ```bash
   pnpm dev
   ```

### Access

- **Web App:** http://localhost:3000
- **API:** http://localhost:3001
- **API Docs (Swagger):** http://localhost:3001/api/docs
- **Meilisearch:** http://localhost:7700

## Project Structure

```
iloveberlin/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   ├── shared/       # Shared types & DTOs
│   └── ui/           # Shared UI components
├── docs/             # Project documentation
├── docker-compose.yml
└── turbo.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm format` | Format code with Prettier |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed the database |

## Documentation

See the [docs/](./docs/) directory for complete project documentation including:
- Requirements & user stories
- Architecture decisions
- API specifications
- Database schemas
- Sprint plans
- Deployment guides
