import { StoriesRepository } from "./storiesRepository";
import { VocabularyService } from "../vocabulary/vocabularyService";
import { Base64 } from "../../types/types";
import { combineAudioFromBase64, generateSilence } from "./audio";
import { LemmatizationService } from "./services/lemmatizationService";
import { Story, StoryDB, Lemma } from "./story.types";
import { UnknownWordDraft } from "../unknownWord/unknownWord.types";
import { TranslationService } from "./services/translationService";
import { TextToSpeechService } from "./services/textToSpeechService";
import { StoryAudioStorageService } from "./services/storyAudioStorageService";
import { StoryGeneratorService } from "./services/storyGeneratorService";
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
  ): Promise<Story> {
    const words = await vocabularyService.getWords();
    const targetLanguageWords = words.map((word) => word.word);
    const story = await storyGeneratorService.generateStory(
      targetLanguageWords,
      subject
    );

    const cleanedStoryText = story.replace(/\n/g, "");
    const lemmatizedWordsFromStory = await lemmatizationService.lemmatize(
      cleanedStoryText
    );
    const unknownLemmasFromStory = this.extractUnknownLemmasFromStory(
      lemmatizedWordsFromStory,
      targetLanguageWords
    );
    const translatedUnknownLemmas = await lemmatizationService.translateLemmas(
      unknownLemmasFromStory
    );
    const unknownWords = this.convertUnknownLemmasToWords(
      translatedUnknownLemmas,
      unknownLemmasFromStory
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
      story: cleanedStoryText,
      translation: fullTranslation,
      unknownWords,
      audioUrl,
    };
  }

  private extractUnknownLemmasFromStory(
    lemmas: Lemma[],
    knownWords: string[]
  ): Lemma[] {
    return lemmas.filter(
      (lemma: Lemma) =>
        !knownWords.some(
          (targetWord) => targetWord.toLowerCase() === lemma.lemma.toLowerCase()
        )
    );
  }

  private convertUnknownLemmasToWords(
    lemmas: {
      lemma: string;
      translation: string;
      example_sentence: string;
      translation_example_sentence: string;
    }[],
    lemmasFromStory: Lemma[]
  ): UnknownWordDraft[] {
    return lemmas.map((lemma) => ({
      word: lemma.lemma,
      translation: lemma.translation,
      article:
        lemmasFromStory.find((word) => word.lemma === lemma.lemma)?.article ??
        null,
      example_sentence: lemma.example_sentence,
      translation_example_sentence: lemma.translation_example_sentence,
    }));
  }

  private async createAudioForStory(
    translationChunks: { chunk: string; translatedChunk: string }[],
    newWords: UnknownWordDraft[]
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
        textToSpeechService.textToSpeech(word.example_sentence, true),
        longSilenceBase64,
        textToSpeechService.textToSpeech(
          word.translation_example_sentence,
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

  public async saveStoryToDB(story: Story): Promise<StoryDB> {
    const response = await storiesRepository.saveStoryToDB(story);
    if (response.error) {
      throw new Error("Error saving story to database");
    }
    if (!response.data) {
      throw new Error("No story returned from database");
    }
    return response.data;
  }

  public async getAllStories(): Promise<StoryDB[]> {
    const response = await storiesRepository.getAllStories();
    if (response.error) {
      console.error(response.error);
      throw new Error("Error getting all stories");
    }
    return response.data ?? [];
  }
}
