# Codenav

### Repository intelligence for contributors. Understand any codebase in minutes.

> **Status:** Active Development &nbsp;|&nbsp; **Stack:** TypeScript · Next.js · Express · BullMQ · PostgreSQL · Redis · OpenRouter

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Overview

Codenav is a codebase intelligence platform that helps developers understand, navigate, and contribute to large repositories faster.

Instead of being another "chat with your repo" tool, it builds a deterministic knowledge graph from the actual repository structure, dependencies, modules, and execution entry points. The goal is to help a developer go from "I have never seen this repo before" to "I know where to start contributing" in minutes.

Paste a GitHub URL, and Codenav clones the repo, detects the tech stack, analyzes folders and dependencies, generates a module graph, identifies key entry points, and creates an onboarding view for the codebase. If another user analyzes the same repo at the same commit hash, the existing graph is reused instantly.

---

## Features

- **Repository Overview** — language breakdown, module map, file count, entry points
- **Architecture Map** — visual dependency graph built from actual import analysis
- **Guided Learning Paths** — precomputed reading order for key flows: auth, request lifecycle, database layer, worker queue
- **Cache-aware Analysis** — same repo at same commit SHA is never analyzed twice
- **Real-time Progress** — SSE-powered live progress updates as the processor runs each step
- **GitHub OAuth + Magic Link** — passwordless authentication, accounts linked on matching email
- **Modular Processor** — pure analysis engine, no framework coupling, designed for future Go migration

---

## Architecture

```
User
 ↓
Next.js Client
 ↓
Express API
 ↓
BullMQ
 ↓
Processor
    ├─ Clone Repo
    ├─ Detect Languages
    ├─ Build Module Map
    ├─ Build Dependency Graph
    ├─ Detect Entry Points
    ├─ Generate Learning Paths
    └─ Return AnalysisResult
 ↓
PostgreSQL
 ↓
Express API
 ↓
Next.js Dashboard
```

**Progress flow:**

```
Worker → Redis Pub/Sub → SSE Endpoint → Client
```

The processor is a pure library — no database, no Redis, no framework coupling. The worker owns orchestration and DB writes. The server exposes the graph. The client visualizes it.

---

## Tech Stack

| Layer               | Technology                      | Purpose                                          |
| ------------------- | ------------------------------- | ------------------------------------------------ |
| Language            | TypeScript                      | End-to-end type safety                           |
| Package Manager     | pnpm workspaces                 | Monorepo with client, server, processor          |
| Frontend            | Next.js 15 + Tailwind CSS       | App Router, React 19                             |
| Graph Visualization | React Flow                      | Interactive dependency graph                     |
| Backend             | Node.js + Express               | Modular REST API                                 |
| Queue System        | BullMQ + Redis                  | Async job processing, progress pub/sub           |
| Database            | PostgreSQL + Prisma             | Analysis storage, hybrid JSON artifacts          |
| Analysis            | dependency-cruiser + fast-glob  | Deterministic dependency graph generation        |
| Real-time           | Server-Sent Events              | Live analysis progress                           |
| Auth                | JWT + Magic Link + GitHub OAuth | Passwordless, refresh tokens in httpOnly cookies |
| AI                  | OpenRouter (Qwen / DeepSeek)    | Summaries and natural language explanations      |

---

## Project Structure

```
codenav/
├── client/                        # Next.js frontend
│   ├── app/                       # App Router pages
│   ├── components/                # Reusable UI components
│   ├── context/                   # Auth and Query providers
│   ├── hooks/                     # TanStack Query hooks
│   └── lib/
│       └── api/                   # Axios API clients
├── server/                        # Express backend
│   ├── modules/
│   │   ├── auth/                  # Magic link + GitHub OAuth
│   │   ├── repository/            # GitHub API, cache logic, job queuing
│   │   └── analysis/              # SSE endpoint, analysis results
│   ├── common/
│   │   ├── config/                # Prisma, Redis, BullMQ, env
│   │   ├── middleware/            # Auth, validation, error handler
│   │   └── utils/                 # Error classes, types
│   ├── workers/                   # BullMQ worker + progress publisher
│   └── prisma/                    # Schema and migrations
└── processor/                     # Pure analysis engine
    ├── analyzer.ts                # Orchestrator
    ├── cloner.ts                  # Git clone
    ├── language-detector.ts       # Language detection
    ├── module-mapper.ts           # Folder structure map
    ├── graph-builder.ts           # Dependency graph
    ├── entry-point-detector.ts    # Entry point detection
    ├── learning-path-generator.ts # Learning path generation
    └── cleaner.ts                 # Cleanup
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL
- Redis

### Installation

- **Fork the repository**
- **Clone the forked repository**
  ```bash
  git clone https://github.com/yourusername/codenav.git
  ```
- **Install dependencies**
  ```bash
  cd codenav
  pnpm install
  ```

### Environment Variables

Create `server/.env`:

```env
NODE_ENV=development
PORT=8000

DATABASE_URL=postgresql://postgres:password@localhost:5432/codenav

JWT_ACCESS_TOKEN_SECRET=your_secret_here
JWT_REFRESH_TOKEN_SECRET=your_secret_here

REDIS_URL=redis://localhost:6379

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8000/api/v1/auth/github/callback

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USERNAME=your_smtp_user
SMTP_PASSWORD=your_smtp_pass
SMTP_FROM_EMAIL=noreply@codenav.dev

CLIENT_URL=http://localhost:3000
```

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Generate JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Running Locally

**1. Create the database:**

```bash
psql -U postgres -c "CREATE DATABASE codenav;"
```

**2. Run migrations:**

```bash
cd server
pnpm prisma migrate dev
```

**3. Start the server:**

```bash
# From root
pnpm dev:server
```

**4. Start the client:**

```bash
# From root
pnpm dev:client
```

Server runs at `http://localhost:8000`, client at `http://localhost:3000`.

---

## API Reference

All endpoints return:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {}
}
```

Errors return:

```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "NOT_FOUND"
}
```

### Auth

| Method | Endpoint                         | Description                 |
| ------ | -------------------------------- | --------------------------- |
| `POST` | `/api/v1/auth/magic-link/send`   | Send magic link email       |
| `POST` | `/api/v1/auth/magic-link/verify` | Verify token, issue JWT     |
| `GET`  | `/api/v1/auth/github`            | GitHub OAuth redirect       |
| `GET`  | `/api/v1/auth/github/callback`   | GitHub OAuth callback       |
| `POST` | `/api/v1/auth/refresh`           | Refresh access token        |
| `POST` | `/api/v1/auth/logout`            | Logout, clear refresh token |

### Repositories

| Method | Endpoint                       | Description              |
| ------ | ------------------------------ | ------------------------ |
| `POST` | `/api/v1/repositories/analyze` | Submit repo for analysis |

### Analyses

| Method | Endpoint                      | Description                  |
| ------ | ----------------------------- | ---------------------------- |
| `GET`  | `/api/v1/analyses/:id/status` | SSE stream for live progress |
| `GET`  | `/api/v1/analyses/:id`        | Get full analysis result     |

---

## How It Works

### Submitting a Repository

User pastes a GitHub URL. The server validates it, calls the GitHub API to fetch the latest commit SHA, checks if an identical analysis already exists, and either returns the cached result or creates a new analysis job.

### Analysis Pipeline

The BullMQ worker picks up the job and calls the processor:

1. **Clone** — `git clone --depth=1` into `/tmp/codenav/{analysisId}`
2. **Detect Languages** — scan file extensions, compute percentages
3. **Build Module Map** — map top-level folders to modules
4. **Build Dependency Graph** — run dependency-cruiser, extract nodes and edges
5. **Detect Entry Points** — find `app.ts`, `routes/*`, `workers/*`, `index.ts`
6. **Generate Learning Paths** — precompute reading order for key flows
7. **Save Results** — store JSON artifacts in PostgreSQL
8. **Cleanup** — delete cloned repo from disk

### Real-time Progress

As the worker progresses, it publishes events to a Redis channel. The SSE endpoint subscribes to that channel and forwards events to the client. On reconnect, the client immediately receives the latest status from the database.

### Cache

Same repo + same commit SHA = instant result. No re-analysis. Historical analyses are kept — you can compare how a repo evolves across commits.

---

## Roadmap

- [x] GitHub OAuth + Magic Link auth
- [x] Repository analysis pipeline
- [x] Dependency graph generation
- [x] Learning path generation
- [x] Real-time SSE progress
- [x] Analysis caching by commit SHA
- [ ] Repository dashboard
- [ ] Interactive architecture map (React Flow)
- [ ] AI-powered natural language queries
- [ ] Python, Go, Rust support via tree-sitter

**Future extensions**

- [ ] VS Code extension
- [ ] CLI — `codenav analyze github.com/owner/repo`
- [ ] Public repo index — pre-analyzed popular repos

---

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/my-feature`
3. Commit your changes — `git commit -m 'feat: add my feature'`
4. Push to the branch — `git push origin feature/my-feature`
5. Open a Pull Request against `main`
