import { OnboardingController } from "./onboardingController";
import { PrismaError } from "@/errors/PrismaError";

function resStub() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("OnboardingController", () => {
  it("completeOnboarding upserts completed and responds 200", async () => {
    const prisma: any = {
      onboarding: {
        upsert: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    const controller = new OnboardingController(prisma);
    const req: any = { user: { userId: 7 } };
    const res = resStub();

    await controller.completeOnboarding(req, res);
    expect(prisma.onboarding.upsert).toHaveBeenCalledWith({
      where: { userId: 7 },
      update: { status: "completed" },
      create: { user: { connect: { id: 7 } }, status: "completed" },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { success: true },
      pagination: undefined,
    });
  });

  it("completeOnboarding wraps errors in PrismaError", async () => {
    const prisma: any = {
      onboarding: { upsert: jest.fn().mockRejectedValue(new Error("db")) },
    };
    const controller = new OnboardingController(prisma);
    const req: any = { user: { userId: 1 } };
    const res = resStub();

    await expect(
      controller.completeOnboarding(req, res),
    ).rejects.toBeInstanceOf(PrismaError);
  });

  it("checkOnboarding returns completed when record found", async () => {
    const prisma: any = {
      onboarding: { findFirst: jest.fn().mockResolvedValue({ id: 1 }) },
    };
    const controller = new OnboardingController(prisma);
    const req: any = { user: { userId: 10 } };
    const res = resStub();

    await controller.checkOnboarding(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { status: "completed" },
      pagination: undefined,
    });
  });

  it("checkOnboarding returns not_started when not found", async () => {
    const prisma: any = {
      onboarding: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const controller = new OnboardingController(prisma);
    const req: any = { user: { userId: 10 } };
    const res = resStub();

    await controller.checkOnboarding(req, res);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { status: "not_started" },
      pagination: undefined,
    });
  });

  it("checkOnboarding wraps errors in PrismaError", async () => {
    const prisma: any = {
      onboarding: { findFirst: jest.fn().mockRejectedValue(new Error("db")) },
    };
    const controller = new OnboardingController(prisma);
    const req: any = { user: { userId: 10 } };
    const res = resStub();

    await expect(controller.checkOnboarding(req, res)).rejects.toBeInstanceOf(
      PrismaError,
    );
  });
});
