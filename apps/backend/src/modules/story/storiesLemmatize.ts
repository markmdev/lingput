const axios = require("axios");

export type Lemma = {
  lemma: string;
  article: string | null;
  sentence: string;
};

export async function lemmatize(text: string): Promise<Lemma[]> {
  const response = await axios.post("http://localhost:8000/lemmatize", {
    text,
  });
  return response.data.lemmas;
}
