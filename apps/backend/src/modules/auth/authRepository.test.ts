import { AuthRepository } from "./authRepository";

function createRedisMock() {
  const calls: any[] = [];

  const pipelineOps: any[] = [];
  const pipeline = {
    hSet: jest.fn().mockImplementation((key: string, value: any) => {
      pipelineOps.push(["hSet", key, value]);
      return pipeline;
    }),
    expireAt: jest.fn().mockImplementation((key: string, ts: number) => {
      pipelineOps.push(["expireAt", key, ts]);
      return pipeline;
    }),
    exec: jest.fn().mockImplementation(() => {
      calls.push(["multi.exec", pipelineOps.slice()]);
      return Promise.resolve([]);
    }),
  };

  return {
    multi: jest.fn().mockImplementation(() => {
      calls.push(["multi"]);
      return pipeline;
    }),
    hGetAll: jest.fn(),
    del: jest.fn(),
    __getCalls: () => calls,
    __getPipelineOps: () => pipelineOps,
  } as any;
}

function getKey(token: string) {
  return `refreshToken:${token}`;
}

describe("AuthRepository", () => {
  it("saveRefreshToken uses namespaced key for both hSet and expireAt", async () => {
    const redis = createRedisMock();
    const repo = new AuthRepository(redis);

    const token = "tkn";
    const expiresAt = new Date(Date.now() + 1000);
    const userId = 7;

    await repo.saveRefreshToken(token, expiresAt, userId);

    const ops = redis.__getPipelineOps();
    // Expect first op hSet with namespaced key
    expect(ops[0][0]).toBe("hSet");
    expect(ops[0][1]).toBe(getKey(token));
    expect(ops[0][2]).toEqual({ token, userId: String(userId) });

    // Expect expireAt uses the same key
    expect(ops[1][0]).toBe("expireAt");
    expect(ops[1][1]).toBe(getKey(token));
    // timestamp in seconds
    const ts = ops[1][2];
    expect(typeof ts).toBe("number");
    expect(ts).toBe(Math.floor(expiresAt.getTime() / 1000));
  });

  it("getRefreshTokenRecord returns null for empty hash", async () => {
    const redis = createRedisMock();
    redis.hGetAll.mockResolvedValue({});
    const repo = new AuthRepository(redis);

    const res = await repo.getRefreshTokenRecord("abc");
    expect(res).toBeNull();
    expect(redis.hGetAll).toHaveBeenCalledWith(getKey("abc"));
  });

  it("getRefreshTokenRecord maps types correctly", async () => {
    const redis = createRedisMock();
    redis.hGetAll.mockResolvedValue({ token: "abc", userId: "123" });
    const repo = new AuthRepository(redis);

    const res = await repo.getRefreshTokenRecord("abc");
    expect(res).toEqual({ token: "abc", userId: 123 });
  });

  it("revokeToken uses namespaced key", async () => {
    const redis = createRedisMock();
    const repo = new AuthRepository(redis);

    await repo.revokeToken("deadbeef");
    expect(redis.del).toHaveBeenCalledWith(getKey("deadbeef"));
  });
});
