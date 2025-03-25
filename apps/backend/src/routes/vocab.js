const express = require("express");
const router = express.Router();
const { saveWord, getAllWords } = require("./../db/vocab");

router.get("/words", async (req, res) => {
  const { data, error } = await getAllWords();
  if (error) {
    console.error(error);
    res.send(error);
  } else {
    res.send(data);
  }
});

router.post("/words", async (req, res) => {
  const { word, translation } = req.body;
  const error = await saveWord(word, translation);
  if (error) {
    console.error(error);
    res.send(error);
  } else {
    res.send("Success");
  }
});

module.exports = router;
