import dotenv from "dotenv";
dotenv.config();
import express from "express";
import vocabRouter from "./modules/vocabulary/vocabularyRoutes";
import storiesRouter from "./modules/story/storiesRoutes";
import unknownWordRouter from "./modules/unknownWord/unknownWordRoutes";
import { errorHandler } from "./middlewares/errorHandler";
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/vocab", vocabRouter);
app.use("/api/stories", storiesRouter);
app.use("/api/unknown-words", unknownWordRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
