import { getAllWordsFromDB, saveWordToDB } from "../db/vocab";
import { Request, Response } from "express";

async function getAllWordsController(req: Request, res: Response) {
  const { data, error } = await getAllWordsFromDB();
  if (error) {
    console.error(error);
    res.send(error);
  } else {
    res.send(data);
  }
}

async function saveNewWordController(req: Request, res: Response) {
  const { word, translation } = req.body;
  const error = await saveWordToDB(word, translation);
  if (error) {
    console.error(error);
    res.send(error);
  } else {
    res.send("Success");
  }
}

export { getAllWordsController, saveNewWordController };
