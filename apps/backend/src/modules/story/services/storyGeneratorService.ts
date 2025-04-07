import openai from "../../../services/openaiClient";

export class StoryGeneratorService {
  async generateStory(
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
                Make it 2 sentences long.
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
}
