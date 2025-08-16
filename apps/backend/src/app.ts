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
  storyModule,
  unknownWordModule,
  vocabAssessmentModule,
  vocabularyModule,
} from "./container";
import { closeIORedisConnection } from "./services/redis/redisConnection";

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

app.use("/api/vocab", vocabularyModule.router);
app.use("/api/story", storyModule.router);
app.use("/api/unknown-words", unknownWordModule.router);
app.use("/api/auth", authRouter);
app.use("/api/vocab-assessment", vocabAssessmentModule.router);
app.use("/api/jobs", jobsModule.router);

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

app.use(errorHandler);

const startServer = async () => {
  await connectRedis();

  const server = app.listen(port, () => {
    logger.info(`Listening on ${port}`);
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Stopping server...`);
    prisma.$disconnect();
    await closeRedisConnection();
    await closeIORedisConnection();
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
    process.on(sig, () => gracefulShutdown(sig));
  });

  process.on("uncaughtException", (err) => {
    logger.error("Uncaught exception:", err);
    gracefulShutdown("uncaughtException");
  });
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection:", reason);
    gracefulShutdown("unhandledRejection");
  });
};

startServer();
