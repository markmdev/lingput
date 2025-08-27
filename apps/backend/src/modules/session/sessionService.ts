/* eslint-disable @typescript-eslint/no-explicit-any */
import { SessionRepository } from "./sessionRepository";

export class SessionService {
  constructor(private sessionRepository: SessionRepository) {}

  async createSession(userId: number, state: any) {
    const session = await this.sessionRepository.createSession(userId, state);
    return session;
  }

  async getSession(userId: number, sessionUUID: string) {
    const session = await this.sessionRepository.getSession(
      userId,
      sessionUUID,
    );
    return session;
  }

  async updateSessionState(userId: number, sessionUUID: string, state: any) {
    const session = await this.sessionRepository.updateSessionState(
      userId,
      sessionUUID,
      state,
    );
    return session;
  }

  async completeSession(userId: number, sessionUUID: string) {
    const session = await this.sessionRepository.completeSession(
      userId,
      sessionUUID,
    );
    return session;
  }
}
