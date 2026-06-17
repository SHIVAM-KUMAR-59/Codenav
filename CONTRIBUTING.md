# Contributing to Codenav

First off, thank you for considering contributing to Codenav.

Codenav is an open-source codebase intelligence platform that helps developers understand unfamiliar repositories through deterministic repository analysis, dependency graphs, architecture visualization, and guided learning paths.

Whether you're fixing a typo, improving documentation, reporting bugs, adding tests, optimizing performance, or building major features, your contributions are appreciated.

---

# Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Coding Standards](#coding-standards)
- [Architecture Guidelines](#architecture-guidelines)
- [Branching Strategy](#branching-strategy)
- [Commit Messages](#commit-messages)
- [Issue Workflow](#issue-workflow)
- [Pull Request Process](#pull-request-process)
- [Adding a New Analysis Stage](#adding-a-new-analysis-stage)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Questions and Discussions](#questions-and-discussions)

---

# Code of Conduct

Be respectful, constructive, and collaborative.

We welcome contributors of all experience levels. Good first issues, documentation improvements, testing contributions, bug fixes, architectural improvements, and major features are all valuable contributions.

Please assume good intent and keep discussions professional.

---

# Getting Started

Before contributing, it helps to understand the core concepts behind Codenav:

### Repository

A Git repository submitted by a user for analysis.

### Analysis

A snapshot of repository intelligence generated for a specific commit SHA.

### Dependency Graph

A deterministic graph representing module relationships built from actual source code imports.

### Learning Path

A generated sequence of files, folders, and modules designed to help developers understand specific application flows.

### Cache

Analyses are cached by repository URL and commit SHA.

If the same repository is analyzed at the same commit hash, the cached analysis is reused instead of reprocessing.

---

# Project Overview

Codenav helps developers understand large codebases quickly.

Given a GitHub repository, Codenav:

- Clones the repository
- Detects languages and frameworks
- Builds a module map
- Generates dependency graphs
- Detects application entry points
- Creates guided learning paths
- Produces AI-assisted explanations
- Stores results for future reuse

The goal is to help developers understand where to start contributing to a project in minutes instead of hours.

---

# Project Structure

```text
codenav/
├── client/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── context/
│   └── lib/
│
├── server/
│   ├── modules/
│   │   ├── auth/
│   │   ├── repository/
│   │   └── analysis/
│   │
│   ├── common/
│   │   ├── config/
│   │   ├── middleware/
│   │   └── utils/
│   │
│   ├── workers/
│   └── prisma/
│
└── processor/
    ├── analyzer.ts
    ├── cloner.ts
    ├── language-detector.ts
    ├── module-mapper.ts
    ├── graph-builder.ts
    ├── entry-point-detector.ts
    ├── learning-path-generator.ts
    └── cleaner.ts
```

### Directory Responsibilities

#### client/

Contains the Next.js frontend.

Responsibilities:

- UI rendering
- Authentication state
- Repository dashboards
- Graph visualization
- Analysis views

#### server/

Contains API endpoints, workers, authentication, persistence, and orchestration logic.

Responsibilities:

- Authentication
- Repository management
- Job scheduling
- Analysis persistence
- SSE progress updates

#### processor/

Contains the deterministic analysis engine.

Responsibilities:

- Repository analysis
- Dependency graph generation
- Language detection
- Learning path generation

The processor should remain framework-independent whenever possible.

---

# Development Setup

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL
- Redis
- Git

---

## Clone the Repository

```bash
git clone https://github.com/<your-username>/codenav.git

cd codenav
```

---

## Install Dependencies

```bash
pnpm install
```

---

# Environment Variables

Create:

```bash
server/.env
```

Required variables:

```env
NODE_ENV=development
PORT=8000

DATABASE_URL=

JWT_ACCESS_TOKEN_SECRET=
JWT_REFRESH_TOKEN_SECRET=

REDIS_URL=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=

SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=

CLIENT_URL=

GROQ_API_KEY=
```

Create:

```bash
client/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

# Running Locally

## Create Database

```sql
psql -U postgres
CREATE DATABASE "codenav";
```

---

## Run Migrations

```bash
cd server

pnpm prisma migrate dev
```

---

## Start Redis

```bash
redis-server
```

---

## Start Backend

```bash
pnpm dev:server
```

---

## Start Frontend

```bash
pnpm dev:client
```

Frontend:

```text
http://localhost:3000/dashboard
```

Backend:

```text
http://localhost:8000
```

## Running tests

```bash
pnpm test
```

---

# Coding Standards

All contributions must pass linting and formatting checks.

```bash
pnpm lint
```

```bash
pnpm format
```

---

## TypeScript

Strict typing is expected.

### Avoid

```ts
const data: any = {};
```

### Prefer

```ts
const data: RepositoryResponse = {};
```

---

## Naming Conventions

| Item            | Convention           |
| --------------- | -------------------- |
| Files           | kebab-case           |
| Components      | PascalCase           |
| Classes         | PascalCase           |
| Functions       | camelCase            |
| Variables       | camelCase            |
| Constants       | SCREAMING_SNAKE_CASE |
| Database tables | snake_case           |

---

## Logging

Avoid:

```ts
console.log();
```

Use the shared logger.

---

## Environment Variables

Avoid:

```ts
process.env.MY_KEY;
```

outside configuration modules.

Import typed configuration instead.

---

# Architecture Guidelines

These rules are important.

## Controllers

Controllers should:

- Read request data
- Call services
- Return responses

Controllers should not:

- Contain business logic
- Perform complex validation
- Execute database queries directly

---

## Services

Services should contain business logic.

Services should:

- Validate application rules
- Coordinate repositories
- Throw typed errors

Services should not:

- Know about Express
- Access request objects

---

## Processor

The processor should remain deterministic.

Given:

```text
Same repository
Same commit SHA
```

The processor should produce identical results.

Avoid introducing:

- Hidden state
- Randomness
- Time-dependent behavior

without strong justification.

---

## Workers

Workers should:

- Execute jobs
- Publish progress
- Persist results

Workers should not:

- Contain API-specific logic
- Render UI-specific data

---

## Before Opening a PR

Run:

```bash
pnpm lint
pnpm format
```

---

# Branching Strategy

Use descriptive branch names.

```text
feature/add-python-support

feature/reanalyze-button

fix/repository-filtering

refactor/analysis-service

docs/contributing-guide
```

---

# Commit Messages

Follow Conventional Commits.

Format:

```text
type(scope): description
```

Examples:

```text
feat(repository): add re-analyze functionality

fix(auth): prevent unauthorized dashboard access

refactor(processor): extract graph generation service

docs(readme): update installation instructions

test(repository): add repository endpoint coverage
```

---

# Issue Workflow

Before starting work:

1. Check existing issues.
2. Comment that you'd like to work on it.
3. Wait for assignment if maintainers use assignments.
4. Ask questions if requirements are unclear.

Avoid duplicate work.

---

# Pull Request Process

## Before Opening a PR

- Ensure code builds successfully.
- Ensure tests pass.
- Rebase on latest main.
- Verify linting passes.

---

## PR Requirements

Every PR should include:

- Clear title
- Linked issue number
- Description of changes
- Screenshots (for UI changes)
- Testing notes

---

## Review Process

Maintainers may request:

- Additional tests
- Refactoring
- Documentation updates
- Design changes

Please keep review discussions constructive.

---

## Squashing

If a branch contains many intermediate commits, squash them before merging.

---

# Adding a New Analysis Stage

Most processor contributions fall into this category.

Examples:

- Framework detection
- Python support
- Go support
- Rust support
- New graph generation strategies
- New learning path generators

---

## Step 1

Create the analysis module:

```text
processor/
└── my-analysis-stage.ts
```

---

## Step 2

Implement deterministic behavior.

Avoid:

```ts
Math.random();
Date.now();
```

unless required.

---

## Step 3

Integrate with:

```ts
analyzer.ts;
```

---

## Step 4

Add tests.

Ensure repeated runs produce consistent output.

---

# Reporting Bugs

Use the Bug Report template.

Include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment information
- Screenshots if applicable

The more details provided, the easier it is to reproduce and fix.

---

# Suggesting Features

Use the Feature Request template.

Include:

- Problem statement
- Proposed solution
- Alternatives considered
- Scope of the change

For larger architectural changes, consider opening a discussion before implementation.

---

# Good First Issues

Issues labeled:

```text
good first issue
```

are specifically designed for new contributors.

These usually involve:

- Documentation improvements
- Frontend polish
- Small bug fixes
- Test coverage
- Developer experience improvements

If you're new to open source, these are a great place to start.

---

# Questions and Discussions

Use GitHub Discussions for:

- Architecture questions
- Design proposals
- Roadmap discussions
- Contribution guidance

Use Issues for:

- Bugs
- Features
- Refactors

---

Thank you for contributing to Codenav.

Every contribution helps make understanding large codebases easier for developers around the world. 🚀
