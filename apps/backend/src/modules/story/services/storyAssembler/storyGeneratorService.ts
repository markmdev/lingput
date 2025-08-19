import { OpenAIError } from "@/errors/OpenAIError";
import { LanguageCode, LANGUAGES_MAP } from "@/utils/languages";
import OpenAI from "openai";
import { Response as OpenAIResponse } from "openai/resources/responses/responses";

export class StoryGeneratorService {
  constructor(private openai: OpenAI) {}
  async generateStory(
    targetLanguageWords: string[],
    subject: string,
    languageCode: LanguageCode
  ): Promise<string> {
    let response: OpenAIResponse;
    try {
      response = await this.openai.responses.create({
        model: "gpt-5-mini",
        reasoning: { effort: "low" },
        input: [
          {
            role: "system",
            content: `
                You are given a list of ${LANGUAGES_MAP[languageCode]} words that the user has learned.  
Your task: create a small story (8-12 sentences) in ${LANGUAGES_MAP[languageCode]}.  

Requirements:  

1. **Vocabulary**  
   - Use mostly words from the list.  
   - Sometimes add new words (on average ~1 per sentence), but only if it sounds natural and the difficulty is similar to the given words.  
   - Do not force a new word if it makes the sentence unnatural.  
   - You are not required to use all the words provided by the user. You can only use some of them.

2. **Grammar**  
   - All sentences must be grammatically correct.  
   - Adapt your grammar to the level of the words used. If the words are very simple, use simple grammar. If the user knows more complex words, use more complex grammar as well.
   - Vary sentence structures (statements, questions, negations, conjunctions, or subclauses).  

3. **Style**  
   - Focus on natural, authentic sentences, that are used in everyday life  
   - Avoid textbook-like or robotic phrasing.  
   - Add small, concrete details (objects, feelings, places) to make the story vivid.  
   - Keep a natural rhythm: vary sentence length and structure.  

**Priority order:**  
1. Grammar correctness  
2. Naturalness of sentences  
3. Vocabulary balance
                `,
          },
          {
            role: "user",
            content: `Here are the words: ${targetLanguageWords.join(", ")}`,
          },
        ],
      });
    } catch (error) {
      throw new OpenAIError("Unable to generate a story", error, { subject });
    }

    const story = response.output_text;
    if (!story) {
      throw new OpenAIError("Unable to generate a story", null, { targetLanguageWords, subject });
    }
    return story;
  }
}
