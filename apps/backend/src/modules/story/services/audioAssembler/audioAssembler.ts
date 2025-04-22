import { CreateUnknownWordDTO } from "@/modules/unknownWord/unknownWord.types";
import { Base64 } from "@/types/types";
import { generateSilence, combineAudioFromBase64 } from "./audioUtils";
import { StoryAudioStorageService } from "./storyAudioStorageService";
import { TextToSpeechService } from "./textToSpeechService";
import { ChunkTranslation } from "../storyAssembler/translationService";

export class AudioAssembler {
  constructor(
    private storyAudioStorageService: StoryAudioStorageService,
    private textToSpeechService: TextToSpeechService
  ) {}

  async assemble(translationChunks: ChunkTranslation[], unknownWords: CreateUnknownWordDTO[]): Promise<string> {
    const audio = await this.createAudioForStory(translationChunks, unknownWords);
    const audioUrl = await this.storyAudioStorageService.saveToStorage(audio);
    return audioUrl;
  }

  private async createAudioForStory(
    translationChunks: ChunkTranslation[],
    newWords: CreateUnknownWordDTO[]
  ): Promise<Base64> {
    const longSilenceBase64 = await generateSilence(2);
    const shortSilenceBase64 = await generateSilence(1);
    const veryShortSilenceBase64 = await generateSilence(0.3);

    const germanAudioBase64 = await Promise.all(
      translationChunks.flatMap((chunk) => [
        this.textToSpeechService.textToSpeech(chunk.chunk, true),
        veryShortSilenceBase64,
      ])
    );

    const transitionAudioBase64 = await this.textToSpeechService.textToSpeech(
      "Now listen to the story with translation.",
      false
    );

    const translationTransitionAudioBase64 = await this.textToSpeechService.textToSpeech(
      "Now listen to the new vocabulary and try to remember it.",
      false
    );

    const translationAudioBase64 = await Promise.all(
      translationChunks.flatMap((chunk) => [
        this.textToSpeechService.textToSpeech(chunk.chunk, true),
        longSilenceBase64,
        this.textToSpeechService.textToSpeech(chunk.translatedChunk, false),
        shortSilenceBase64,
      ])
    );

    const newWordsAudioBase64 = await Promise.all(
      newWords.flatMap((word) => [
        this.textToSpeechService.textToSpeech(`${word.article ?? ""} ${word.word}`, true),
        longSilenceBase64,
        this.textToSpeechService.textToSpeech(word.translation, false),
        shortSilenceBase64,
        this.textToSpeechService.textToSpeech(word.exampleSentence, true),
        longSilenceBase64,
        this.textToSpeechService.textToSpeech(word.exampleSentenceTranslation, false),
        shortSilenceBase64,
      ])
    );

    const combinedAudioBase64 = await combineAudioFromBase64([
      germanAudioBase64,
      [transitionAudioBase64],
      translationAudioBase64,
      [translationTransitionAudioBase64],
      newWordsAudioBase64,
    ]);

    return combinedAudioBase64;
  }
}
