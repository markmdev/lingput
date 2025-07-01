import { Router } from "express";
import { asyncHandler } from "@/middlewares/asyncHandler";
import { authMiddleware } from "@/middlewares/authMiddlewareFactory";
import { JobsController } from "./jobsController";

const router = Router();
const jobsController = new JobsController();

router.get("/status/:queue/:jobId", authMiddleware, asyncHandler(jobsController.jobStatus));

export default router;
