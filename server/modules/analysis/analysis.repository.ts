import { Analysis, AnalysisStatus, Prisma, PrismaClient } from "../../prisma/generated/prisma";

export class AnalysisRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: Prisma.AnalysisCreateInput): Promise<Analysis> {
    return this.prisma.analysis.create({ data });
  }

  async findById(id: string): Promise<Analysis | null> {
    return this.prisma.analysis.findUnique({ where: { id } });
  }

  async findByRepositoryAndCommit(
    repositoryId: string,
    commitSha: string
  ): Promise<Analysis | null> {
    return this.prisma.analysis.findUnique({
      where: { repositoryId_commitSha: { repositoryId, commitSha } },
    });
  }

  async findLatestByRepository(repositoryId: string): Promise<Analysis | null> {
    return this.prisma.analysis.findFirst({
      where: { repositoryId },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(
    id: string,
    status: AnalysisStatus,
    progress: number,
    message?: string
  ): Promise<Analysis> {
    return this.prisma.analysis.update({
      where: { id },
      data: {
        status,
        progress,
        message,
        startedAt: status === AnalysisStatus.CLONING ? new Date() : undefined,
        completedAt: status === AnalysisStatus.COMPLETED ? new Date() : undefined,
      },
    });
  }

  async updateError(id: string, error: string): Promise<Analysis> {
    return this.prisma.analysis.update({
      where: { id },
      data: {
        status: AnalysisStatus.FAILED,
        error,
        completedAt: new Date(),
      },
    });
  }

  async saveResults(id: string, results: Prisma.AnalysisUpdateInput): Promise<Analysis> {
    return this.prisma.analysis.update({
      where: { id },
      data: results,
    });
  }
}
