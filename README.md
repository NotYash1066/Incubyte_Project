# Incubyte Project — Dealership Inventory Management

A full-stack vehicle inventory management system with authentication, role-based access control, and TDD-driven development.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js v24 |
| **Server** | Express + TypeScript |
| **Database** | SQLite (via Prisma ORM) |
| **Auth** | JWT (bcryptjs + jsonwebtoken) |
| **Validation** | Zod |
| **Client** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 |
| **Testing** | Vitest + Testing Library + MSW |

## Setup

```bash
# Install all dependencies (server + client)
npm install

# Set up environment
cp .env.example .env

# Run database migration
npm run db:migrate -w server

# Seed the database (creates admin user + sample vehicles)
npm run db:seed -w server

# Start both server and client
npm run dev

# Or start individually:
npm run dev -w server   # http://localhost:3001
npm run dev -w client   # http://localhost:5173
```

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@incubyte.com | password123 |
| User | user@incubyte.com | password123 |

## Running Tests

```bash
# All tests (server + client)
npm test

# Server only (38 tests)
npm test -w server

# Client only (11 tests)
npm test -w client
```

## API Reference

All endpoints except `POST /api/auth/*` require a `Bearer <token>` authorization header.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT token |

**Auth Response**: `{ token, user: { id, email, name, role } }`

### Vehicles

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/vehicles` | Yes | Any | List all vehicles |
| GET | `/api/vehicles/:id` | Yes | Any | Get vehicle by ID |
| POST | `/api/vehicles` | Yes | Admin | Create vehicle |
| PUT | `/api/vehicles/:id` | Yes | Admin | Update vehicle |
| DELETE | `/api/vehicles/:id` | Yes | Admin | Delete vehicle |
| POST | `/api/vehicles/:id/purchase` | Yes | Any | Purchase a vehicle (decrements stock) |
| POST | `/api/vehicles/:id/restock` | Yes | Admin | Restock a vehicle (increments stock) |

**Vehicle fields**: `make`, `model`, `year`, `category` (SEDAN|SUV|TRUCK|COUPE|VAN), `price`, `quantity`

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## Architecture

```
incubyte-project/
├── server/                 # Express API server
│   ├── src/
│   │   ├── lib/            # Prisma client, AppError, asyncHandler
│   │   ├── middleware/      # auth, admin, errorHandler
│   │   ├── routes/          # auth, vehicles
│   │   ├── app.ts           # Express app setup
│   │   └── index.ts         # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma    # User & Vehicle models
│   │   └── seed.ts          # Seed data
│   └── tests/               # 38 integration tests
└── client/                 # React SPA
    ├── src/
    │   ├── components/      # Navbar, ProtectedRoute
    │   ├── contexts/        # AuthContext
    │   ├── lib/             # apiRequest utility
    │   ├── pages/           # Login, Register, Dashboard, Admin
    │   └── App.tsx          # Router + providers
    └── src/App.test.tsx     # 11 component tests
```

## Test Report

### Server (38 tests, 4 test files)

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `tests/auth.test.ts` | 8 | Register validation, duplicate email, login success/failure, auth middleware |
| `tests/vehicles.test.ts` | 16 | CRUD operations, admin-only enforcement, auth checks |
| `tests/inventory.test.ts` | 12 | Purchase flow, insufficient stock, restock, admin-only restock |
| `tests/app.test.ts` | 2 | Health check, 404 handling |

### Client (11 tests, 1 test file)

| Test Group | Tests | Coverage |
|-----------|-------|----------|
| Auth | 3 | Unauthenticated redirect, navigation login↔register |
| Dashboard | 5 | Vehicle list rendering, price formatting, stock display, buy flow, auth redirect |
| Admin | 3 | Admin page rendering, add vehicle form, delete vehicle |

## AI Usage Disclosure

This project was developed using AI-assisted engineering through **OpenCode** (powered by Claude) as the primary development interface. Here is how AI was used:

### Development Process

The project followed a **TDD (Test-Driven Development)** methodology, but AI was leveraged through an orchestrator-agent architecture:

1. **Architecture & Planning**: The high-level architecture, technology choices, and work breakdown were designed by the human developer. AI was used to validate decisions and suggest alternatives.

2. **Test Writing**: All test cases (RED phase) were authored by AI based on the human developer's specification of endpoint behavior and edge cases.

3. **Implementation (GREEN phase)**: All production code was written by specialized AI sub-agents operating under strict constraints:
   - No `as any`, `@ts-ignore`, or type suppression
   - Must follow existing codebase patterns
   - All changes must pass tests before commit

4. **Orchestration**: The Sisyphus orchestrator agent managed task decomposition, parallel delegation, code review, and quality gates. Human developer provided continuous feedback and course corrections.

5. **Code Quality**: The `doubly-determined-development` approach was used — every implementation decision was verified against the test suite. The refactor phase (T11) introduced `AppError`, `asyncHandler`, and a global error handler to eliminate boilerplate.

### Verification

- All code was automatically verified: clean `lsp_diagnostics`, passing test suites, build success
- Commits are atomic per task with meaningful messages
- No code was merged without passing its test suite
