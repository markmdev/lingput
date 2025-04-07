import express from "express";
const router = express.Router();
import { VocabularyController } from "./vocabularyController";

const vocabularyController = new VocabularyController();

router.get("/words", vocabularyController.getAllWordsController);

router.post("/words", vocabularyController.saveNewWordController);

router.post("/words/list", vocabularyController.saveManyWordsController);

router.delete("/words/:id", vocabularyController.deleteWordController);

export default router;
