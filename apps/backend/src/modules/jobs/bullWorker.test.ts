import { BullWorker, JobHandler } from "./bullWorker";
import { Job } from "bullmq";

// Mock Worker to avoid real connections
jest.mock("bullmq", () => {
  const actual = jest.requireActual("bullmq");
  return {
    ...actual,
    Worker: jest
      .fn()
      .mockImplementation((_queue: string, _proc: any, _opts: any) => ({
        on: jest.fn(),
        close: jest.fn(),
      })),
  };
});

// Mock container to avoid importing real container that instantiates Queue/Redis
jest.mock("@/container", () => ({
  storyModule: { service: { decrementLimitCount: jest.fn() } },
}));

// Silence logger in this test file
jest.mock("@/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe("BullWorker", () => {
  const connection: any = { host: "localhost", port: 6379 };

  it("calls registered handler and returns result", async () => {
    const handlers = new Map<string, JobHandler>();
    const handler = jest.fn().mockResolvedValue("ok");
    handlers.set("task", handler);

    const worker = new BullWorker("q", connection, handlers);
    const job = { id: "1", name: "task" } as unknown as Job;

    const res = await worker.processor(job);
    expect(handler).toHaveBeenCalledWith(job);
    expect(res).toBe("ok");
  });

  it("throws on unknown task name", async () => {
    const handlers = new Map<string, JobHandler>();
    const worker = new BullWorker("q", connection, handlers);
    const job = { id: "1", name: "unknown" } as unknown as Job;

    await expect(worker.processor(job)).rejects.toMatchObject({
      message: "Unknown task name",
    });
  });

  it("propagates handler errors", async () => {
    const handlers = new Map<string, JobHandler>();
    const err = new Error("boom");
    handlers.set("task", jest.fn().mockRejectedValue(err));

    const worker = new BullWorker("q", connection, handlers);
    const job = { id: "2", name: "task" } as unknown as Job;

    await expect(worker.processor(job)).rejects.toBe(err);
  });
});
