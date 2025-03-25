const client = require("./client");

async function saveWord(word, translation) {
  const { error } = await client.from("vocabulary").insert({
    word,
    translation,
  });

  return error;
}

async function getAllWords() {
  const { data, error } = await client.from("vocabulary").select();

  return { data, error };
}

module.exports = {
  saveWord,
  getAllWords,
};
