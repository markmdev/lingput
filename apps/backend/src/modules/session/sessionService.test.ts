import { SessionService } from "./sessionService";

describe("SessionService", () => {
  it("createSession proxies to repo", async () => {
    const repo: any = {
      createSession: jest.fn().mockResolvedValue({ sessionUUID: "u" }),
    };
    const svc = new SessionService(repo);
    const res = await svc.createSession(1, { a: 1 });
    expect(repo.createSession).toHaveBeenCalledWith(1, { a: 1 });
    expect(res).toEqual({ sessionUUID: "u" });
  });

  it("getSession proxies to repo", async () => {
    const repo: any = {
      getSession: jest.fn().mockResolvedValue({ sessionUUID: "u" }),
    };
    const svc = new SessionService(repo);
    const res = await svc.getSession(1, "u");
    expect(repo.getSession).toHaveBeenCalledWith(1, "u");
    expect(res).toEqual({ sessionUUID: "u" });
  });

  it("updateSessionState proxies to repo", async () => {
    const repo: any = {
      updateSessionState: jest.fn().mockResolvedValue({ state: { a: 2 } }),
    };
    const svc = new SessionService(repo);
    const res = await svc.updateSessionState(1, "u", { a: 2 });
    expect(repo.updateSessionState).toHaveBeenCalledWith(1, "u", { a: 2 });
    expect(res).toEqual({ state: { a: 2 } });
  });

  it("completeSession proxies to repo", async () => {
    const repo: any = {
      completeSession: jest.fn().mockResolvedValue({ status: "completed" }),
    };
    const svc = new SessionService(repo);
    const res = await svc.completeSession(1, "u");
    expect(repo.completeSession).toHaveBeenCalledWith(1, "u");
    expect(res).toEqual({ status: "completed" });
  });
});
