import express from "express";
const router = express.Router();
import {
  deleteWordController,
  getAllWordsController,
  saveNewWordController,
} from "./vocabularyController";

router.get("/words", getAllWordsController);

router.post("/words", saveNewWordController);

router.delete("/words/:id", deleteWordController);

export default router;
