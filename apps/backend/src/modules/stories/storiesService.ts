import openai from "../../services/openaiClient";
import { StoriesRepository } from "./storiesRepository";
import { VocabularyService } from "../vocabulary/vocabularyService";
import { StorageResponse } from "../../types/repositories";
import { Base64 } from "../../types/types";
import { combineAudioFromBase64, generateSilence } from "./audio";
import {
  Lemma,
  lemmatizeAndTranslate,
  LemmatizedText,
} from "./storiesLemmatize";

const vocabularyService = new VocabularyService();
const storiesRepository = new StoriesRepository();

export class StoriesService {
  async generateFullStoryExperience(subject: string = "") {
    const words = await vocabularyService.getWords();
    const targetLanguageWords = words.map((word) => word.word);
    const { story, newWords } = await this.generateStory(
      targetLanguageWords,
      subject
    );
    console.log("story", story);
    console.log("newWords", newWords);
    return { story, newWords };
    const translationChunks = await this.translateChunks(story);
    const audio = await this.createAudioForStory(translationChunks);
    const fileName = await this.saveStoryToStorage(audio);
    return fileName;
  }

  async createAudioForStory(
    translationChunks: { chunk: string; translatedChunk: string }[]
  ): Promise<Base64> {
    const germanAudioBase64 = await Promise.all(
      translationChunks.map((chunk) => this.textToSpeech(chunk.chunk, true))
    );

    const transitionAudioBase64 = await this.textToSpeech(
      "Now listen to the story with translation.",
      false
    );

    const longSilenceBase64 = await generateSilence(2);
    const shortSilenceBase64 = await generateSilence(1);

    const translationAudioBase64 = await Promise.all(
      translationChunks.flatMap((chunk) => [
        this.textToSpeech(chunk.chunk, true),
        longSilenceBase64,
        this.textToSpeech(chunk.translatedChunk, false),
        shortSilenceBase64,
      ])
    );

    const combinedAudioBase64 = await combineAudioFromBase64([
      germanAudioBase64,
      [transitionAudioBase64],
      translationAudioBase64,
    ]);

    return combinedAudioBase64;
  }

  async generateStory(
    targetLanguageWords: string[],
    subject: string
  ): Promise<{
    story: string;
    newWords: { lemma: string; translation: string; article: string | null }[];
  }> {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `
            You are given a list of German words that I've learned. I want to practice reading now. I want you to create a story in German. But this story should meet some requirements:

            1. 98% of the words in the story should be the words from the list I provided. Other words should be new to me, but similar by level of difficulty. It means that from 20 words in the story, 19 should be from the list, and 1 should be new. This is very important.
            2. All story should use only present tense
            3. Use these guidelines to create an engagement story:
            - Avoid using very generalized phrasing
            - Add a personal voice/tone/touch to the text
            - Don't overuse repetitive sentence structures
            - Avoid using very polished and neutral tone
            - Use specific examples
            - Don't use artificially smooth transitions
            - Avoid generic and overexplained points
            - Avoid formulaic expressions
            - Use natural flow and variations in sentence structure
            - Always use specific personal details, to make the text look like it was written by a human. Add such details, that only a real human being could include in the text.
            4. Use various grammar structures, to practice all grammar rules.

            Create a story that is engaging and interesting to read.
            Here is a subject of the story:
            ${subject}
            Make it 5 sentences long.
            `,
        },
        {
          role: "user",
          content: `Here are the words: ${targetLanguageWords.join(", ")}`,
        },
      ],
    });

    const story = response.choices[0].message.content;
    if (!story) {
      throw new Error("No story text returned");
    }
    // remove \n symbols
    const cleanedStoryText = story.replace(/\n/g, "");
    const lemmatizedWordsFromStory = await lemmatizeAndTranslate(
      cleanedStoryText
    );
    const newWordsFromStory = lemmatizedWordsFromStory.lemmas.filter(
      (lemma: Lemma) =>
        !targetLanguageWords.some(
          (targetWord) => targetWord.toLowerCase() === lemma.lemma.toLowerCase()
        )
    );
    const translatedLemmas = await this.translateLemmas(newWordsFromStory);
    const newWords = translatedLemmas.map((lemma) => ({
      lemma: lemma.lemma,
      translation: lemma.translation,
      article:
        newWordsFromStory.find((word) => word.lemma === lemma.lemma)?.article ??
        null,
    }));
    return { story: cleanedStoryText, newWords };
  }

  async translateLemmas(
    lemmas: Lemma[]
  ): Promise<{ lemma: string; translation: string }[]> {
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "system",
          content: `You are a helpful translator. Your task is to translate the following lemmas to English:
          ${JSON.stringify(
            lemmas.map((lemma) => ({
              lemma: lemma.lemma,
              sentence: lemma.sentence,
            }))
          )}
          Translate only the words, not the sentences. Sentence is just for context. Translate in the context of the sentence.
          Don't change the form of the word.
          `,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "translation",
          schema: {
            type: "object",
            properties: {
              lemmas: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    lemma: { type: "string" },
                    translation: { type: "string" },
                  },
                  required: ["lemma", "translation"],
                  additionalProperties: false,
                },
              },
            },
            required: ["lemmas"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.output_text;
    if (!content) {
      throw new Error("No content returned from translation service");
    }

    return JSON.parse(content).lemmas;
  }

  async translateChunks(
    story: string
  ): Promise<{ chunk: string; translatedChunk: string }[]> {
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "system",
          content: `You are a helpful translator. Your task is to:
          1. Break down the given story into meaningful chunks (7-8 words. It can be either a full sentence, or just a part of a sentence)
          2. Translate each chunk to English
          3. Return the chunks in a structured format with both original and translated text
          
          Guidelines:
          - Keep chunks at a reasonable length (7-8 words)
          - Maintain the original meaning and tone
          - Preserve any cultural context
          - Ensure translations are natural and fluent in English
          `,
        },
        {
          role: "user",
          content: story,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "translation",
          schema: {
            type: "object",
            properties: {
              chunks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    chunk: { type: "string" },
                    translatedChunk: { type: "string" },
                  },
                  required: ["chunk", "translatedChunk"],
                  additionalProperties: false,
                },
              },
            },
            required: ["chunks"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.output_text;
    if (!content) {
      throw new Error("No content returned from translation service");
    }

    const result = JSON.parse(content);
    if (!result.chunks || !Array.isArray(result.chunks)) {
      throw new Error("Invalid response format from translation service");
    }

    return result.chunks;
  }

  async textToSpeech(text: string, isTargetLanguage: boolean): Promise<Base64> {
    const instructions = isTargetLanguage
      ? "Speak as you are voiceover a story for 'Comprehensible Input' method of learning. You must speak in a slow pace. Speak expressively. The language is German"
      : "Calm voice, narrator style. The language is English";
    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "shimmer",
      input: text,
      instructions,
    });

    const buffer = await Buffer.from(await response.arrayBuffer());
    const base64 = buffer.toString("base64");
    return base64;
  }

  async saveStoryToStorage(story: Base64): Promise<StorageResponse<string>> {
    const fileName = await storiesRepository.saveStoryToStorage(story);
    return fileName;
  }
}
