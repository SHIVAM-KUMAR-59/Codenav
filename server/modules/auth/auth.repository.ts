import { Prisma, PrismaClient, User } from "../../prisma/generated/prisma";

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserByGithubID(githubId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { githubId } });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async updateUser(id: string, data: Partial<Omit<User, "id">>): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async createMagicLink(
    token: string,
    userId: string,
    email: string,
    expiresAt: Date
  ): Promise<void> {
    await this.prisma.magicLink.create({
      data: {
        token,
        userId,
        email,
        expiresAt,
      },
    });
  }

  async findMagicLink(token: string) {
    return this.prisma.magicLink.findUnique({ where: { token } });
  }

  async markMagicLinkAsUsed(token: string): Promise<boolean> {
    const result = await this.prisma.magicLink.updateMany({
      where: {
        token,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        usedAt: new Date(),
      },
    });

    return result.count === 1;
  }

  async deleteMagicLink(token: string): Promise<void> {
    await this.prisma.magicLink.delete({ where: { token } });
  }

  async saveRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
    await this.prisma.refreshToken.upsert({
      where: { token: refreshToken },
      update: { userId, expiresAt },
      create: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshToken.findUnique({ where: { token } });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({ where: { token } });
  }

  async deleteAllRefreshTokensForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async findUserById(userId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
}
