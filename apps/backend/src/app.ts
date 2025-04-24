declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
      user: { userId: number };
    }
  }
}

import dotenv from "dotenv";
import express from "express";
import vocabRouter from "./modules/vocabulary/vocabularyRoutes";
import storiesRouter from "./modules/story/storyRoutes";
import unknownWordRouter from "./modules/unknownWord/unknownWordRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { authRouter } from "./modules/auth/authRoutes";
import { requestLogger } from "./middlewares/requestLogger";
import { logger } from "./utils/logger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { prisma } from "./services/prisma";

dotenv.config();
const app = express();
const port = process.env.PORT;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  legacyHeaders: false,
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(limiter);
app.use(helmet());
app.use(requestLogger);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/vocab", vocabRouter);
app.use("/api/story", storiesRouter);
app.use("/api/unknown-words", unknownWordRouter);
app.use("/api/auth", authRouter);

app.use(errorHandler);

const server = app.listen(port, () => {
  logger.info(`Listening on ${port}`);
});

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Stopping server...`);
  server.close((err) => {
    if (err) {
      logger.error("Error closing server:", err);
      process.exit(1);
    }
    prisma.$disconnect();
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
  gracefulShutdown("unhandlerRejection");
});
