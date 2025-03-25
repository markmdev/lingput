import client from "../services/supabase";

async function saveWordToDB(word: string, translation: string) {
  const { error } = await client.from("vocabulary").insert({
    word,
    translation,
  });

  return error;
}

async function getAllWordsFromDB() {
  const { data, error } = await client.from("vocabulary").select();

  return { data, error };
}

export { saveWordToDB, getAllWordsFromDB };
