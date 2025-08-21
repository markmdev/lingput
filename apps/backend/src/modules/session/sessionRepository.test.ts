import { SessionRepository } from "./sessionRepository";
import { RedisError } from "@/errors/RedisError";

function createRedisMock() {
  const store: Record<string, Record<string, string>> = {};

  const pipelineOps: any[] = [];
  const pipeline = {
    hSet: jest.fn().mockImplementation((key: string, data: any) => {
      store[key] = {
        ...(store[key] || {}),
        ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      };
      pipelineOps.push(["hSet", key, data]);
      return pipeline;
    }),
    expire: jest.fn().mockImplementation((key: string, ttl: number) => {
      // we don't simulate TTL, only record call
      pipelineOps.push(["expire", key, ttl]);
      return pipeline;
    }),
    exec: jest.fn().mockResolvedValue([]),
  };

  const hGetAll = jest.fn(async (key: string) => store[key] || {});
  const multi = jest.fn().mockReturnValue(pipeline);

  return {
    multi,
    hSet: pipeline.hSet,
    hGetAll,
    expire: pipeline.expire,
    __ops: pipelineOps,
  } as any;
}

describe("SessionRepository", () => {
  it("createSession writes namespaced key with state JSON and expiry", async () => {
    const redis = createRedisMock();
    const repo = new SessionRepository(redis);

    const state = { x: 1 };
    const session = await repo.createSession(7, state);

    const key = `vocabAssessmentSession:7:${session.sessionUUID}`;
    await expect(redis.hGetAll(key)).resolves.toEqual({
      userId: "7",
      state: JSON.stringify(state),
      sessionUUID: session.sessionUUID,
      status: "active",
    });
  });

  it("getSession requires sessionUUID and parses JSON", async () => {
    const redis = createRedisMock();
    const repo = new SessionRepository(redis);

    const created = await repo.createSession(1, { a: 2 });
    const session = await repo.getSession(1, created.sessionUUID);
    expect(session.userId).toBe(1);
    expect(session.state).toEqual({ a: 2 });
  });

  it("getSession throws when sessionUUID missing", async () => {
    const redis = createRedisMock();
    const repo = new SessionRepository(redis);
    await expect(repo.getSession(1, "" as any)).rejects.toBeInstanceOf(RedisError);
  });

  it("updateSessionState updates only state JSON and returns parsed session", async () => {
    const redis = createRedisMock();
    const repo = new SessionRepository(redis);
    const { sessionUUID } = await repo.createSession(3, { a: 1 });

    const updated = await repo.updateSessionState(3, sessionUUID, { a: 999 });
    expect(updated.state).toEqual({ a: 999 });
    expect(updated.status).toBe("active");
  });

  it("completeSession sets status completed and returns parsed session", async () => {
    const redis = createRedisMock();
    const repo = new SessionRepository(redis);
    const { sessionUUID } = await repo.createSession(9, { s: 0 });

    const completed = await repo.completeSession(9, sessionUUID);
    expect(completed.status).toBe("completed");
  });

  it("parseSession wraps invalid JSON in RedisError", async () => {
    const hGetAll = jest
      .fn()
      .mockResolvedValue({ userId: "1", state: "{", sessionUUID: "u", status: "active" });
    const redis: any = { hGetAll, multi: jest.fn(), hSet: jest.fn(), expire: jest.fn() };
    const repo = new SessionRepository(redis);
    await expect(repo.getSession(1, "u")).rejects.toBeInstanceOf(RedisError);
  });
});
