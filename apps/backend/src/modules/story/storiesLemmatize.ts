const axios = require("axios");

export type Lemma = {
  lemma: string;
  article: string | null;
  sentence: string;
};

export type LemmatizedText = {
  lemmas: Lemma[];
};

export async function lemmatizeAndTranslate(
  text: string
): Promise<LemmatizedText> {
  const response = await axios.post("http://localhost:8000/lemmatize", {
    text,
  });
  return response.data;
}
