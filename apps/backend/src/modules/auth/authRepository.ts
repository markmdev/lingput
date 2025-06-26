import { AppRedisClient } from "@/services/redis";

export class AuthRepository {
  constructor(private redis: AppRedisClient) {}

  async saveRefreshToken(refreshToken: string, expiresAt: Date, userId: number) {
    const timestampInSeconds = Math.floor(expiresAt.getTime() / 1000);
    await this.redis
      .multi()
      .hSet(refreshToken, {
        token: refreshToken,
        userId: userId.toString(),
      })
      .expireAt(refreshToken, timestampInSeconds)
      .exec();
  }

  async getRefreshTokenRecord(refreshToken: string) {
    const value = await this.redis.hGetAll(refreshToken);
    return {
      token: value.token,
      userId: Number(value.userId),
    };
  }

  async revokeToken(oldToken: string) {
    await this.redis.del(oldToken);
  }
}
