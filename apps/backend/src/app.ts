import express from "express";
import { config } from "dotenv";
import vocabRouter from "./routes/vocab";

config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/api/vocab", vocabRouter);

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
