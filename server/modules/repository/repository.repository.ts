import { Prisma, PrismaClient, Repository } from "../../prisma/generated/prisma";
import { RepositoryWithLatestAnalysis } from "./repository.types";

export class RepositoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUrl(url: string): Promise<Repository | null> {
    return this.prisma.repository.findUnique({ where: { url } });
  }

  async findByOwnerAndName(owner: string, name: string): Promise<Repository | null> {
    return this.prisma.repository.findUnique({ where: { owner_name: { owner, name } } });
  }

  async findWithLatestAnalysis(url: string): Promise<RepositoryWithLatestAnalysis | null> {
    return this.prisma.repository.findUnique({
      where: { url },
      include: {
        analyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  }

  async create(data: Prisma.RepositoryCreateInput): Promise<Repository> {
    return this.prisma.repository.create({ data });
  }

  async update(id: string, data: Prisma.RepositoryUpdateInput): Promise<Repository> {
    return this.prisma.repository.update({ where: { id }, data });
  }

  async findById(id: string): Promise<Repository | null> {
    return this.prisma.repository.findUnique({ where: { id } });
  }
}
