import express from "express";
const router = express.Router();
import {
  deleteWordController,
  getAllWordsController,
  saveManyWordsController,
  saveNewWordController,
} from "./vocabularyController";

router.get("/words", getAllWordsController);

router.post("/words", saveNewWordController);

router.post("/words/list", saveManyWordsController);

router.delete("/words/:id", deleteWordController);

export default router;
