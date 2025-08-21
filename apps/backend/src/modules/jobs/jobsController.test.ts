import { JobsController } from "./jobsController";

function resStub() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("JobsController", () => {
  it("returns 404 when job not found", async () => {
    const queue: any = { getJob: jest.fn().mockResolvedValue(null) };
    const controller = new JobsController(queue);

    const req: any = { params: { jobId: "abc" } };
    const res = resStub();

    await controller.jobStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: "Job not found", code: 404, details: undefined },
    });
  });

  it("returns job state details when found", async () => {
    const job: any = {
      getState: jest.fn().mockResolvedValue("completed"),
      returnvalue: "ok",
      failedReason: null,
      progress: { phase: "x", totalSteps: 8 },
    };
    const queue: any = { getJob: jest.fn().mockResolvedValue(job) };
    const controller = new JobsController(queue);

    const req: any = { params: { jobId: "abc" } };
    const res = resStub();

    await controller.jobStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        status: "completed",
        value: "ok",
        failedReason: null,
        progress: { phase: "x", totalSteps: 8 },
      },
      pagination: undefined,
    });
  });
});
