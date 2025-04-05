import openai from "../../services/openaiClient";
import { StoriesRepository } from "./storiesRepository";
import { VocabularyService } from "../vocabulary/vocabularyService";
import { Base64 } from "../../types/types";
import { combineAudioFromBase64, generateSilence } from "./audio";
import { Lemma, lemmatize } from "./storiesLemmatize";
import { Story, StoryDB } from "./story.types";
import { UnknownWordDraft } from "../unknownWord/unknownWord.types";

const vocabularyService = new VocabularyService();
const storiesRepository = new StoriesRepository();

export class StoriesService {
  public async generateFullStoryExperience(
    subject: string = ""
  ): Promise<Story> {
    const words = await vocabularyService.getWords();
    const targetLanguageWords = words.map((word) => word.word);
    const story = await this.generateStory(targetLanguageWords, subject);

    const cleanedStoryText = story.replace(/\n/g, "");
    const lemmatizedWordsFromStory = await lemmatize(cleanedStoryText);
    const unknownLemmasFromStory = this.extractUnknownLemmasFromStory(
      lemmatizedWordsFromStory,
      targetLanguageWords
    );
    const translatedUnknownLemmas = await this.translateLemmas(
      unknownLemmasFromStory
    );
    const unknownWords = this.convertUnknownLemmasToWords(
      translatedUnknownLemmas,
      unknownLemmasFromStory
    );

    const translationChunks = await this.translateChunks(cleanedStoryText);
    const fullTranslation = translationChunks
      .map((chunk) => chunk.translatedChunk)
      .join(" ");
    const audio = await this.createAudioForStory(
      translationChunks,
      unknownWords
    );
    const audioUrl = await this.saveStoryAudioToStorage(audio);
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
        this.textToSpeech(chunk.chunk, true),
        veryShortSilenceBase64,
      ])
    );

    const transitionAudioBase64 = await this.textToSpeech(
      "Now listen to the story with translation.",
      false
    );

    const translationTransitionAudioBase64 = await this.textToSpeech(
      "Now listen to the new vocabulary and try to remember it.",
      false
    );

    const translationAudioBase64 = await Promise.all(
      translationChunks.flatMap((chunk) => [
        this.textToSpeech(chunk.chunk, true),
        longSilenceBase64,
        this.textToSpeech(chunk.translatedChunk, false),
        shortSilenceBase64,
      ])
    );

    const newWordsAudioBase64 = await Promise.all(
      newWords.flatMap((word) => [
        this.textToSpeech(`${word.article ?? ""} ${word.word}`, true),
        longSilenceBase64,
        this.textToSpeech(word.translation, false),
        shortSilenceBase64,
        this.textToSpeech(word.example_sentence, true),
        longSilenceBase64,
        this.textToSpeech(word.translation_example_sentence, false),
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

  private async generateStory(
    targetLanguageWords: string[],
    subject: string
  ): Promise<string> {
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
    return story;
  }

  private async translateLemmas(lemmas: Lemma[]): Promise<
    {
      lemma: string;
      translation: string;
      example_sentence: string;
      translation_example_sentence: string;
    }[]
  > {
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "system",
          content: `You are a helpful and context-aware translator. Your task is to translate the following lemmas (base word forms) into natural English, using the sentence as context.

          For each lemma:
          - Translate **only the lemma**, not the sentence.
          - Use the **sentence only as context** to choose the most appropriate meaning.
          - Consider the lemma’s **part of speech** (e.g., noun, verb, adjective).
          - If the word has multiple meanings, provide the **most likely one** in this context. You may include **multiple translations**, separated by commas.
          - Avoid literal or overly generic translations if a more specific or idiomatic meaning fits better.
          - Keep the lemma in its base form.
          - Do **not** include proper names (e.g., Max, Berlin) in the response — skip them entirely.

          In addition, for each lemma:
          - Create a **simple original example sentence** in German using the lemma naturally.
          - Then provide the **English translation** of your example sentence.
          - The example sentence should be short, natural, and helpful for learners. Do not copy from the input sentence — generate a **new** one.
          `,
        },
        {
          role: "user",
          content: `Here are the lemmas: ${JSON.stringify(
            lemmas.map((lemma) => ({
              lemma: lemma.lemma,
              sentence: lemma.sentence,
            }))
          )}`,
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
                    example_sentence: { type: "string" },
                    translation_example_sentence: { type: "string" },
                  },
                  required: [
                    "lemma",
                    "translation",
                    "example_sentence",
                    "translation_example_sentence",
                  ],
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

  private async translateChunks(
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

  private async textToSpeech(
    text: string,
    isTargetLanguage: boolean
  ): Promise<Base64> {
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

  public async saveStoryAudioToStorage(storyAudio: Base64): Promise<string> {
    const response = await storiesRepository.saveStoryAudioToStorage(
      storyAudio
    );
    if (response.error) {
      throw new Error("Error saving story audio to storage");
    }
    if (!response.data) {
      throw new Error("No file name returned from storage service");
    }
    return response.data.path;
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

  public async getStorySignedAudioUrl(storyId: number): Promise<string> {
    const story = await storiesRepository.getStoryById(storyId);
    if (story.error) {
      throw new Error("Error getting story");
    }
    if (!story.data) {
      throw new Error("No story returned from database");
    }
    const response = await storiesRepository.getSignedStoryAudioUrl(
      story.data.audio_url
    );
    if (response.error) {
      throw new Error("Error getting signed story audio url");
    }
    if (!response.data) {
      throw new Error(
        "No signed story audio url returned from storage service"
      );
    }
    return response.data.signedUrl;
  }
}
