import express from "express";
const router = express.Router();
import {
  getAllWordsController,
  saveNewWordController,
} from "./../controllers/vocabController";

router.get("/words", getAllWordsController);

router.post("/words", saveNewWordController);

export default router;
