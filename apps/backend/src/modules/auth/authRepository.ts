import { AppRedisClient } from "@/services/redis/redisClient";

export class AuthRepository {
  constructor(private redis: AppRedisClient) {}

  private getKey(key: string) {
    return `refreshToken:${key}`;
  }

  async saveRefreshToken(refreshToken: string, expiresAt: Date, userId: number) {
    const key = this.getKey(refreshToken);
    const timestampInSeconds = Math.floor(expiresAt.getTime() / 1000);
    await this.redis
      .multi()
      .hSet(key, {
        token: refreshToken,
        userId: userId.toString(),
      })
      .expireAt(key, timestampInSeconds)
      .exec();
  }

  async getRefreshTokenRecord(refreshToken: string) {
    const key = this.getKey(refreshToken);
    const value = await this.redis.hGetAll(key);
    if (!value || Object.keys(value).length === 0) return null;
    return {
      token: value.token,
      userId: Number(value.userId),
    };
  }

  async revokeToken(oldToken: string) {
    const key = this.getKey(oldToken);
    await this.redis.del(key);
  }
}
