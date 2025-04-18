import { PrismaClient } from "@prisma/client";

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async saveRefreshToken(refreshToken: string, expiresAt: Date, userId: number) {
    const result = await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: expiresAt,
        userId,
      },
    });
  }

  async getRefreshTokenRecord(refreshToken: string = "") {
    return this.prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
    });
  }

  async revokeToken(oldToken: string, newToken: string = "") {
    await this.prisma.refreshToken.update({
      where: { token: oldToken },
      data: {
        revokedAt: new Date(Date.now()),
        replacedBy: newToken,
      },
    });
  }
}
