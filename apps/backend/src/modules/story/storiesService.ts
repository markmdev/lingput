import { StoriesRepository } from "./storiesRepository";
import { VocabularyService } from "../vocabulary/vocabularyService";
import { Base64 } from "../../types/types";
import { combineAudioFromBase64, generateSilence } from "./audio";
import { LemmatizationService } from "./services/lemmatizationService";
import { CreateStoryDTO, Lemma, LemmaWithTranslation } from "./story.types";
import { TranslationService } from "./services/translationService";
import { TextToSpeechService } from "./services/textToSpeechService";
import { StoryAudioStorageService } from "./services/storyAudioStorageService";
import { StoryGeneratorService } from "./services/storyGeneratorService";
import { Story } from "@prisma/client";
import { CreateUnknownWordDTO } from "../unknownWord/unknownWord.types";
const vocabularyService = new VocabularyService();
const storiesRepository = new StoriesRepository();
const storyGeneratorService = new StoryGeneratorService();
const lemmatizationService = new LemmatizationService();
const translationService = new TranslationService();
const textToSpeechService = new TextToSpeechService();
const storyAudioStorageService = new StoryAudioStorageService();

export class StoriesService {
  public async generateFullStoryExperience(
    subject: string = ""
  ): Promise<CreateStoryDTO> {
    const words = await vocabularyService.getWords();
    const targetLanguageWords = words.map((word) => word.word);
    const story = await storyGeneratorService.generateStory(
      targetLanguageWords,
      subject
    );

    const cleanedStoryText = story.replace(/\n/g, "");
    const storyLemmas = await lemmatizationService.lemmatize(cleanedStoryText);
    const unknownLemmas = this.filterUnknownLemmas(
      storyLemmas,
      targetLanguageWords
    );
    const translatedUnknownLemmas = await lemmatizationService.translateLemmas(
      unknownLemmas
    );
    const unknownWords = this.mapUnknownLemmasToCreateUnknownWordDTO(
      translatedUnknownLemmas,
      unknownLemmas
    );

    const translationChunks = await translationService.translateChunks(
      cleanedStoryText
    );
    const fullTranslation = translationChunks
      .map((chunk) => chunk.translatedChunk)
      .join(" ");
    const audio = await this.createAudioForStory(
      translationChunks,
      unknownWords
    );
    const audioUrl = await storyAudioStorageService.saveToStorage(audio);
    return {
      storyText: cleanedStoryText,
      translationText: fullTranslation,
      audioUrl,
      unknownWords,
    };
  }

  private filterUnknownLemmas(
    storyLemmas: Lemma[],
    knownWords: string[]
  ): Lemma[] {
    return storyLemmas.filter(
      (lemma: Lemma) =>
        !knownWords.some(
          (targetWord) => targetWord.toLowerCase() === lemma.lemma.toLowerCase()
        )
    );
  }

  private mapUnknownLemmasToCreateUnknownWordDTO(
    translatedUnknownLemmas: LemmaWithTranslation[],
    originalLemmas: Lemma[]
  ): CreateUnknownWordDTO[] {
    return translatedUnknownLemmas.map((lemma) => ({
      word: lemma.lemma,
      translation: lemma.translation,
      article:
        originalLemmas.find((word) => word.lemma === lemma.lemma)?.article ??
        null,
      exampleSentence: lemma.exampleSentence,
      exampleSentenceTranslation: lemma.exampleSentenceTranslation,
      storyId: null,
    }));
  }

  private async createAudioForStory(
    translationChunks: { chunk: string; translatedChunk: string }[],
    newWords: CreateUnknownWordDTO[]
  ): Promise<Base64> {
    const longSilenceBase64 = await generateSilence(2);
    const shortSilenceBase64 = await generateSilence(1);
    const veryShortSilenceBase64 = await generateSilence(0.3);

    const germanAudioBase64 = await Promise.all(
      translationChunks.flatMap((chunk) => [
        textToSpeechService.textToSpeech(chunk.chunk, true),
        veryShortSilenceBase64,
      ])
    );

    const transitionAudioBase64 = await textToSpeechService.textToSpeech(
      "Now listen to the story with translation.",
      false
    );

    const translationTransitionAudioBase64 =
      await textToSpeechService.textToSpeech(
        "Now listen to the new vocabulary and try to remember it.",
        false
      );

    const translationAudioBase64 = await Promise.all(
      translationChunks.flatMap((chunk) => [
        textToSpeechService.textToSpeech(chunk.chunk, true),
        longSilenceBase64,
        textToSpeechService.textToSpeech(chunk.translatedChunk, false),
        shortSilenceBase64,
      ])
    );

    const newWordsAudioBase64 = await Promise.all(
      newWords.flatMap((word) => [
        textToSpeechService.textToSpeech(
          `${word.article ?? ""} ${word.word}`,
          true
        ),
        longSilenceBase64,
        textToSpeechService.textToSpeech(word.translation, false),
        shortSilenceBase64,
        textToSpeechService.textToSpeech(word.exampleSentence, true),
        longSilenceBase64,
        textToSpeechService.textToSpeech(
          word.exampleSentenceTranslation,
          false
        ),
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

  public async saveStoryToDB(story: CreateStoryDTO): Promise<Story> {
    return await storiesRepository.saveStoryToDB(story);
  }

  public async getAllStories(): Promise<Story[]> {
    return await storiesRepository.getAllStories();
  }
}
