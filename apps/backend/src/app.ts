import dotenv from "dotenv";
dotenv.config();
import express from "express";
import vocabRouter from "./routes/vocab";

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/vocab", vocabRouter);

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
