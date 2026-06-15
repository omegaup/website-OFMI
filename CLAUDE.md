# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Website for OFMI (Olimpiada Femenil Mexicana de Informática) — manages contestant registration, venue assignment, mentorship scheduling, and admin operations. Built with Next.js Pages Router, Prisma ORM (PostgreSQL), and Tailwind CSS.

## Development Environment

The app runs entirely via Docker Compose. Node v20.

```bash
# Start the app + database
docker compose up

# Run commands inside the container
docker compose exec app <command>
```

- App: http://localhost:3000
- Prisma Studio: http://localhost:5555
- DB: PostgreSQL on port 5432 (user: ofmi, password: ofmi)

Environment variables are in `.env.dev` (loaded automatically by docker-compose).

## Common Commands

All commands below run inside the Docker container (`docker compose exec app ...`):

```bash
# Format + lint (run before committing)
npm run format          # tsc --noEmit + prisma format + prettier --write + eslint --fix
npm run format-ci       # CI version (checks only, no writes)

# Tests (require running DB — use docker compose)
npm run test            # vitest watch mode
npm run test-ci         # vitest run (single pass)
npx vitest run src/__tests__/api/upsertParticipation.test.ts  # single test file

# Prisma
npx prisma generate     # regenerate client after schema changes
npm run migrate:dev     # create + apply migration
npm run push            # push schema without creating migration file

# Build
npm run build
```

## Architecture

### Schema Validation

Uses `@sinclair/typebox` for runtime schema validation (not Zod). Schemas live in `src/types/*.schema.ts`. API handlers validate request bodies with `Value.Check()` / `Value.Errors()` from typebox.

### API Endpoints

Next.js API routes in `src/pages/api/`. Pattern:

- Handler validates body against a TypeBox schema
- Calls business logic from `src/lib/`
- Returns typed response

### Admin Panel

`src/pages/admin.tsx` renders a generic form UI driven by `src/components/admin/client.ts`. The `APIS` object maps endpoint paths to `[method, TypeBoxSchema]` pairs — the admin page auto-generates forms from these schemas using `@rjsf/core`.

To add a new admin endpoint: add an entry in `client.ts` APIS, create the handler in `src/pages/api/admin/`, and define the schema in `src/types/admin.schema.ts`.

### Key Domain Concepts

- **Ofmi**: An edition/year of the olympiad
- **Participation**: Links a User to an Ofmi with a role (CONTESTANT or VOLUNTEER)
- **ContestantParticipation**: Contestant-specific data (school, venue assignment, results)
- **VolunteerParticipation**: Volunteer role preferences (mentor, trainer, etc.)
- **VenueQuota**: Per-venue capacity for a given Ofmi edition; `occupied` counter tracks assignments
- **Soft delete**: `ContestantParticipation.deletedAt` — queries for active contestants must filter `deletedAt: null`

### Test Pattern

Tests in `src/__tests__/` use vitest + `node-mocks-http`. They hit a real database (the Docker Compose postgres). Each test file sets up its own data in `beforeAll` and tears it down in `afterAll`.

### Google Cloud Integration

`src/lib/gcloud.ts` handles Google Drive folder creation and Google Sheets export for participants. Requires OAuth tokens stored via `UserOauth` model. The `ofmiUserImpersonator` provides a service account for automated operations.

## CI

GitHub Actions (`.github/workflows/test.yaml`): builds Docker, runs format-ci, migrations, build, and test-ci. PRs and pushes to main trigger it.
