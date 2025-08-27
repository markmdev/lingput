import { Lemma, LemmaWithTranslation } from "../../story.types";
import axios from "axios";
import { OpenAIError } from "@/errors/OpenAIError";
import { Response as OpenAIResponse } from "openai/resources/responses/responses";
import OpenAI from "openai";
import { LemmatizationError } from "@/errors/LemmatizationError";
import { LanguageCode, LANGUAGES_MAP } from "@/utils/languages";
export type OpenAILemmasResponse = {
  lemmas: LemmaWithTranslation[];
};

export class LemmatizationService {
  constructor(private openai: OpenAI) {}
  // TODO: add support for other languages
  async lemmatize(text: string): Promise<Lemma[]> {
    try {
      const response = await axios.post(
        `${process.env.LEMMA_SERVICE_URL}/lemmatize`,
        {
          text,
        },
      );
      return response.data.lemmas;
    } catch (error) {
      throw new LemmatizationError(
        "Server error: Unable to lemmatize text",
        error,
        { text },
      );
    }
  }

  async translateLemmas(
    lemmas: Lemma[],
    languageCode: LanguageCode,
    originalLanguageCode: LanguageCode,
  ): Promise<LemmaWithTranslation[]> {
    let response: OpenAIResponse;
    try {
      response = await this.openai.responses.create({
        model: "gpt-5-mini",
        reasoning: { effort: "low" },
        input: [
          {
            role: "system",
            content: `You are a helpful and context-aware translator.  
Your task is to translate the given **lemmas (base word forms)** into natural ${LANGUAGES_MAP[originalLanguageCode]}, using the accompanying sentence as context.  

### Requirements for each lemma

1. **Translation**  
   - Translate **only the lemma**, not the entire sentence.  
   - Use the **sentence only as context** to choose the most appropriate meaning.  
   - Consider the lemma’s **part of speech** (noun, verb, adjective, etc.).  
   - If the lemma has multiple possible meanings, provide the **most likely one** in this context.  
   - If several translations are valid, include them separated by commas.  
   - Avoid literal or overly generic translations if a more specific or idiomatic one fits better.  
   - Always keep the lemma in its **base form**.  
   - Skip proper names (e.g., Max, Berlin) entirely.  

2. **Example sentence generation**  
   - Create one **short, simple, original sentence** in ${LANGUAGES_MAP[languageCode]} that uses the lemma naturally.  
   - Provide a **translation of that example sentence** into ${LANGUAGES_MAP[originalLanguageCode]}.  
   - Do not copy or reuse the given input sentence — generate a new, natural example.  
   - Keep example sentences **learner-friendly and practical**.  

3. **Output format**  
   For each lemma, return the result in a structured format with:  
   - The **lemma**  
   - The **translation(s)**  
   - The **example sentence in ${LANGUAGES_MAP[languageCode]}**  
   - The **translation of the example sentence in ${LANGUAGES_MAP[originalLanguageCode]}**  
          `,
          },
          {
            role: "user",
            content: `Here are the lemmas: ${JSON.stringify(
              lemmas.map((lemma) => ({
                lemma: lemma.lemma,
                sentence: lemma.sentence,
              })),
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
                    required: [
                      "lemma",
                      "translation",
                      "exampleSentence",
                      "exampleSentenceTranslation",
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
    } catch (error) {
      throw new OpenAIError("Unable to translate lemmas", error, { lemmas });
    }

    const content = response.output_text;

    if (!content) {
      throw new OpenAIError("Unable to translate lemmas", null, { lemmas });
    }

    const result = this.parseResponseContent(content);

    return result.lemmas;
  }

  private parseResponseContent(content: string): OpenAILemmasResponse {
    let result: OpenAILemmasResponse;
    try {
      result = JSON.parse(content) as OpenAILemmasResponse;
    } catch (error) {
      throw new OpenAIError("Invalid response format, try again", error, {
        content,
      });
    }
    if (!result.lemmas || !Array.isArray(result.lemmas)) {
      throw new OpenAIError("Invalid response format, try again", null, {
        content,
        result,
      });
    }
    return result;
  }
}
