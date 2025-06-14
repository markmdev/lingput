import { SessionRepository } from "./sessionRepository";

export class SessionService {
  constructor(private sessionRepository: SessionRepository) {}

  async createSession(userId: number, state: any) {
    const session = await this.sessionRepository.createSession(userId, state);
    return session;
  }

  async getSession(sessionUUID: string) {
    const session = await this.sessionRepository.getSession(sessionUUID);
    return session;
  }

  async updateSessionState(sessionUUID: string, state: any) {
    const session = await this.sessionRepository.updateSessionState(sessionUUID, state);
    return session;
  }

  async completeSession(sessionUUID: string) {
    const session = await this.sessionRepository.completeSession(sessionUUID);
    return session;
  }
}
