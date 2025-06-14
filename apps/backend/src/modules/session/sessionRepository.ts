import { PrismaError } from "@/errors/PrismaError";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

export class SessionRepository {
  constructor(private prisma: PrismaClient) {}

  async createSession(userId: number, state: any) {
    try {
      const newSession = await this.prisma.session.create({
        data: {
          userId,
          state,
          sessionUUID: uuidv4(),
        },
      });
      return newSession;
    } catch (error) {
      throw new PrismaError("Unable to create a new session", error, { userId, state });
    }
  }

  async getSession(sessionUUID: string) {
    if (!sessionUUID) {
      throw new PrismaError("SessionID is required", null, { sessionUUID });
    }

    try {
      const session = await this.prisma.session.findUnique({
        where: {
          sessionUUID,
        },
      });
      return session;
    } catch (error) {
      throw new PrismaError("Unable to retrieve a session", error, { sessionUUID });
    }
  }

  async updateSessionState(sessionUUID: string, state: any) {
    if (!sessionUUID) {
      throw new PrismaError("SessionID is required", null, { sessionUUID });
    }

    try {
      const session = await this.prisma.session.update({
        where: {
          sessionUUID,
        },
        data: {
          state,
        },
      });
      return session;
    } catch (error) {
      throw new PrismaError("Unable to update a session's state", error, { sessionUUID, state });
    }
  }

  async completeSession(sessionUUID: string) {
    if (!sessionUUID) {
      throw new PrismaError("SessionID is required", null, { sessionUUID });
    }

    try {
      const session = await this.prisma.session.update({
        where: {
          sessionUUID,
        },
        data: {
          status: "completed",
        },
      });
      return session;
    } catch (error) {
      throw new PrismaError("Unable to complete a session", error, { sessionUUID });
    }
  }
}
