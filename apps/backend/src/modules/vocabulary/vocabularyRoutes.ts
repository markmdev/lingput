import express from "express";
const router = express.Router();
import {
  getAllWordsController,
  saveNewWordController,
} from "./vocabularyController";

router.get("/words", getAllWordsController);

router.post("/words", saveNewWordController);

export default router;
