FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

FROM base AS deps
ENV HUSKY=0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY server/package.json ./server/
COPY processor/package.json ./processor/
RUN pnpm install --frozen-lockfile

FROM base AS builder
ENV HUSKY=0
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/processor/node_modules ./processor/node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY processor ./processor
COPY server ./server

WORKDIR /app/processor
RUN pnpm build

WORKDIR /app/server
RUN pnpm prisma generate
RUN pnpm build

FROM node:20-alpine AS runner
RUN npm install -g pnpm
WORKDIR /app

ENV NODE_ENV=production
ENV HUSKY=0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.base.json ./
COPY server/package.json ./server/
COPY processor/package.json ./processor/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=builder /app/processor/dist ./processor/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/server/prisma/generated ./server/dist/prisma/generated
COPY --from=builder /app/server/prisma.config.ts ./server/prisma.config.ts

WORKDIR /app/server

EXPOSE 8000

CMD ["node", "dist/index.js"]