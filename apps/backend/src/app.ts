import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/requestLogger";
import { logger } from "./utils/logger";
import { prisma } from "./services/prisma";
import { ApiResponse } from "./types/response.types";
import { closeRedisConnection, connectRedis } from "./services/redis/redisClient";
import {
  authRouter,
  jobsModule,
  onboardingModule,
  storyModule,
  unknownWordModule,
  vocabAssessmentModule,
  vocabularyModule,
} from "./container";
import { closeIORedisConnection } from "./services/redis/redisConnection";
import { liveness, readiness } from "./health";

dotenv.config();
const app = express();
const port = process.env.APP_PORT || 4000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many requests. Please try again later.", code: 429 },
  } satisfies ApiResponse<undefined>,
});

app.use(cors());
app.use(limiter);
app.use(helmet());
app.use(requestLogger);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);

app.use("/api/vocab", vocabularyModule.router);
app.use("/api/story", storyModule.router);
app.use("/api/unknown-words", unknownWordModule.router);
app.use("/api/auth", authRouter);
app.use("/api/vocab-assessment", vocabAssessmentModule.router);
app.use("/api/jobs", jobsModule.router);
app.use("/api/onboarding", onboardingModule.router);

app.get("/healthz", liveness);
app.get("/readyz", readiness);

app.use(errorHandler);

const startServer = async () => {
  await connectRedis();

  const server = app.listen(port, () => {
    logger.info(`Listening on ${port}`);
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Stopping server...`);
    await prisma.$disconnect();
    logger.info("Closed prisma connection");
    await closeRedisConnection();
    logger.info("Closed Redis connection");
    await closeIORedisConnection();
    logger.info("Closed IORedis connection");
    server.close((err) => {
      if (err) {
        logger.error("Error closing server:", err);
        process.exit(1);
      }
      logger.info("All connections closed. Exiting.");
      process.exit(0);
    });

    setTimeout(() => {
      logger.warn("Forcing shutdown after timeout");
      process.exit(1);
    }, 10000).unref();
  };

  ["SIGINT", "SIGTERM"].forEach((sig) => {
    process.once(sig, () => gracefulShutdown(sig));
  });

  process.once("uncaughtException", (err) => {
    logger.error("Uncaught exception:", err);
    gracefulShutdown("uncaughtException");
  });
  process.once("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection:", reason);
    gracefulShutdown("unhandledRejection");
  });
};

startServer();
