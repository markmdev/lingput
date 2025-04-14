import { Lemma, LemmaWithTranslation } from "../../story.types";
import axios from "axios";
import { OpenAIError } from "@/errors/OpenAIError";
import { Response as OpenAIResponse } from "openai/resources/responses/responses";
import OpenAI from "openai";

export type OpenAILemmasResponse = {
  lemmas: LemmaWithTranslation[];
};

export class LemmatizationService {
  constructor(private openai: OpenAI) {}
  async lemmatize(text: string): Promise<Lemma[]> {
    const response = await axios.post("http://localhost:8000/lemmatize", {
      text,
    });
    return response.data.lemmas;
  }

  async translateLemmas(lemmas: Lemma[]): Promise<LemmaWithTranslation[]> {
    let response: OpenAIResponse;
    try {
      response = await this.openai.responses.create({
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
                      exampleSentence: { type: "string" },
                      exampleSentenceTranslation: { type: "string" },
                    },
                    required: ["lemma", "translation", "exampleSentence", "exampleSentenceTranslation"],
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
    } catch (error) {
      throw new OpenAIError("Can't translate lemmas", { lemmas }, error);
    }

    const content = response.output_text;

    if (!content) {
      throw new OpenAIError("Can't translate lemmas", { lemmas });
    }

    const result = this.parseResponseContent(content);

    return result.lemmas;
  }

  private parseResponseContent(content: string): OpenAILemmasResponse {
    let result: OpenAILemmasResponse;
    try {
      result = JSON.parse(content) as OpenAILemmasResponse;
    } catch (error) {
      throw new OpenAIError("Invalid response format, try again", { content }, error);
    }
    if (!result.lemmas || !Array.isArray(result.lemmas)) {
      throw new OpenAIError("Invalid response format, try again", { content, result });
    }
    return result;
  }
}
