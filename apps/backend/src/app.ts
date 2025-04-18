declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
      user: { userId: number };
    }
  }
}

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import vocabRouter from "./modules/vocabulary/vocabularyRoutes";
import storiesRouter from "./modules/story/storyRoutes";
import unknownWordRouter from "./modules/unknownWord/unknownWordRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { authRouter } from "./modules/auth/authRoutes";
import cookieParser from "cookie-parser";
import { requestLogger } from "./middlewares/requestLogger";
import { logger } from "./utils/logger";
import helmet from "helmet";
const app = express();
const port = process.env.PORT;

app.use(helmet());
app.use(requestLogger);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/vocab", vocabRouter);
app.use("/api/stories", storiesRouter);
app.use("/api/unknown-words", unknownWordRouter);
app.use("/api/auth", authRouter);

app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Listening on ${port}`);
});
