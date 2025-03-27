import dotenv from "dotenv";
dotenv.config();
import express from "express";
import vocabRouter from "./modules/vocabulary/vocabularyRoutes";
import storiesRouter from "./modules/stories/storiesRoutes";
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/vocab", vocabRouter);
app.use("/api/stories", storiesRouter);

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
