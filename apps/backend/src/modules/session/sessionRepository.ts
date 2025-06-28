import { RedisError } from "@/errors/RedisError";
import { AppRedisClient } from "@/services/redis";
import { v4 as uuidv4 } from "uuid";

type SessionStatus = "active" | "completed" | "expired";

export interface Session {
  userId: number;
  state: any;
  sessionUUID: string;
  status: SessionStatus;
}

export class SessionRepository {
  constructor(private redis: AppRedisClient) {}

  private getCacheKey(userId: number, sessionUUID: string) {
    return `vocabAssessmentSession:${userId}:${sessionUUID}`;
  }

  async createSession(userId: number, state: any) {
    try {
      const sessionUUID = uuidv4();
      const cacheKey = this.getCacheKey(userId, sessionUUID);
      const session = {
        userId,
        state: JSON.stringify(state),
        sessionUUID,
        status: "active",
      };
      await this.redis.hSet(cacheKey, session);

      return session;
    } catch (error) {
      throw new RedisError("Unable to create a new session", error, { userId, state });
    }
  }

  private parseSession(session: { [x: string]: string }) {
    try {
      return {
        userId: Number(session.userId),
        state: JSON.parse(session.state),
        sessionUUID: session.sessionUUID,
        status: session.status as SessionStatus,
      };
    } catch (error) {
      throw new RedisError("Unable to retrieve a session", error, { session });
    }
  }

  async getSession(userId: number, sessionUUID: string) {
    if (!sessionUUID) {
      throw new RedisError("SessionID is required", null, { sessionUUID });
    }

    try {
      const cacheKey = this.getCacheKey(userId, sessionUUID);
      const session = await this.redis.hGetAll(cacheKey);

      return this.parseSession(session);
    } catch (error) {
      throw new RedisError("Unable to retrieve a session", error, { sessionUUID });
    }
  }

  async updateSessionState(userId: number, sessionUUID: string, state: any) {
    if (!sessionUUID) {
      throw new RedisError("SessionID is required", null, { sessionUUID });
    }

    try {
      const cacheKey = this.getCacheKey(userId, sessionUUID);
      await this.redis.hSet(cacheKey, {
        state: JSON.stringify(state),
      });
      const session = await this.redis.hGetAll(cacheKey);

      return this.parseSession(session);
    } catch (error) {
      throw new RedisError("Unable to update a session's state", error, { sessionUUID, state });
    }
  }

  async completeSession(userId: number, sessionUUID: string) {
    if (!sessionUUID) {
      throw new RedisError("SessionID is required", null, { sessionUUID });
    }

    try {
      const cacheKey = this.getCacheKey(userId, sessionUUID);
      await this.redis.hSet(cacheKey, {
        status: "completed",
      });

      const session = await this.redis.hGetAll(cacheKey);

      return this.parseSession(session);
    } catch (error) {
      throw new RedisError("Unable to complete a session", error, { sessionUUID });
    }
  }
}
