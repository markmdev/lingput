const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const vocabRouter = require("./src/routes/vocab");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/api/vocab", vocabRouter);

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
