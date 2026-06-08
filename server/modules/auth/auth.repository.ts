import { Prisma, PrismaClient, User } from "server/prisma/generated/prisma";

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

  async markMagicLinkAsUsed(token: string): Promise<void> {
    await this.prisma.magicLink.update({
      where: { token },
      data: { usedAt: new Date() },
    });
  }

  async deleteMagicLink(token: string): Promise<void> {
    await this.prisma.magicLink.delete({ where: { token } });
  }

  async saveRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
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
