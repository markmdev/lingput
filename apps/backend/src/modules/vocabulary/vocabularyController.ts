import { Request, Response } from "express";
import { VocabularyService } from "./vocabularyService";

const vocabularyService = new VocabularyService();

async function getAllWordsController(req: Request, res: Response) {
  try {
    const words = await vocabularyService.getWords();
    res.status(200).send(words);
  } catch (error) {
    res.status(500).json({ error: `Failed to get all words: ${error}` });
  }
}

async function saveNewWordController(req: Request, res: Response) {
  const { word, translation, article } = req.body;
  const error = await vocabularyService.saveNewWord({
    word,
    translation,
    article,
  });
  if (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to save new word: ${error}` });
  } else {
    res.status(201).send("Success");
  }
}

async function saveManyWordsController(req: Request, res: Response) {
  const { words } = req.body;
  if (!Array.isArray(words)) {
    res.status(400).json({
      error: "The request body must be an array of objects.",
    });
    return;
  }

  const allWordsValid = words.every(
    (wordObj) => wordObj.word && wordObj.translation
  );
  if (!allWordsValid) {
    res.status(400).json({
      error: "Each word must have a 'word' and 'translation' property.",
    });
    return;
  }

  const error = await vocabularyService.saveManyWords(words);
  if (error) {
    res.status(500).json({ error: `Failed to save many words: ${error}` });
  } else {
    res.status(201).send("Success");
  }
}

async function deleteWordController(req: Request, res: Response) {
  try {
    const wordId = parseInt(req.params.id);
    await vocabularyService.deleteWord(wordId);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to delete a word: ${error}` });
  }
}

export {
  getAllWordsController,
  saveNewWordController,
  saveManyWordsController,
  deleteWordController,
};
