import { vi, beforeEach } from "vitest";

// Mock Prisma
vi.mock("../../prisma/generated/prisma/index.js", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    magicLink: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMane: vi.fn(),
      delete: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    repository: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    analysis: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
  };

  return {
    PrismaClient: vi.fn(() => mockPrisma),
    AnalysisStatus: {
      PENDING: "PENDING",
      FETCHING_METADATA: "FETCHING_METADATA",
      QUEUED: "QUEUED",
      CLONING: "CLONING",
      DETECTING_LANGUAGES: "DETECTING_LANGUAGES",
      BUILDING_FOLDER_MAP: "BUILDING_FOLDER_MAP",
      BUILDING_DEPENDENCY_GRAPH: "BUILDING_DEPENDENCY_GRAPH",
      GENERATING_LEARNING_PATHS: "GENERATING_LEARNING_PATHS",
      SAVING_RESULTS: "SAVING_RESULTS",
      COMPLETED: "COMPLETED",
      FAILED: "FAILED",
    },
  };
});

// Mock ioredis
vi.mock("ioredis", () => {
  const Redis = vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    publish: vi.fn().mockResolvedValue(1),
    subscribe: vi.fn().mockResolvedValue(undefined),
    unsubscribe: vi.fn().mockResolvedValue(undefined),
    quit: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
  }));
  return { default: Redis, Redis };
});

// Mock BullMQ
vi.mock("bullmq", () => ({
  Queue: vi.fn(() => ({
    add: vi.fn().mockResolvedValue({ id: "job-1" }),
    close: vi.fn().mockResolvedValue(undefined),
  })),
  Worker: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    close: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock nodemailer
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test-message-id" }),
    })),
  },
}));

// Mock groq-sdk
vi.mock("groq-sdk", () => ({
  default: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  explanation: "Mock explanation",
                  files: [{ path: "src/auth.ts", role: "Auth handler" }],
                  readingOrder: ["src/auth.ts"],
                }),
              },
            },
          ],
        }),
      },
    },
  })),
}));

// Mock winston logger
vi.mock("../common/config/logger.config", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});
