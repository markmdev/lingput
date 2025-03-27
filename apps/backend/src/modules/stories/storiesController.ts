import { Request, Response } from "express";
import { StoriesService } from "./storiesService";
import { Base64 } from "../../types/types";
import combineAudioFromBase64 from "./audio";
const storiesService = new StoriesService();

export class StoriesController {
  async generateStory(req: Request, res: Response) {
    const story = await storiesService.generateStory();
    const translation = await storiesService.translateStory(story);
    const germanChunks = translation.map((chunk) => chunk.chunk);
    const translationChunks = translation.map((chunk) => chunk.translatedChunk);
    // using Promise.All get a list of base64 strings of audio files after text to speech
    const germanAudioBase64 = await Promise.all(
      germanChunks.map(async (chunk) => {
        const audio: Base64 = await storiesService.textToSpeech(chunk, true);
        return audio;
      })
    );
    const transitionAudioBase64 = await storiesService.textToSpeech(
      "Now listen to the story with translation.",
      false
    );
    const translationSectionBase64 = [];
    for (let i = 0; i < translation.length; i++) {
      translationSectionBase64.push({
        type: "german",
        base64: translation[i].chunk,
      });
      translationSectionBase64.push({
        type: "translation",
        base64: translation[i].translatedChunk,
      });
    }
    const englishAudioBase64 = await Promise.all(
      translationSectionBase64.map(async (chunk) => {
        const audio: Base64 = await storiesService.textToSpeech(
          chunk.base64,
          chunk.type !== "translation"
        );
        return audio;
      })
    );

    await combineAudioFromBase64(
      [germanAudioBase64, [transitionAudioBase64], englishAudioBase64],
      "test.mp3"
    );

    res.status(200).json({ story, translation });
  }
}

export default StoriesController;
