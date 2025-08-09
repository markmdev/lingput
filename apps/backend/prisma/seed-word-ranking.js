const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function deleteExistingData() {
  console.log("Deleting existing word rankings...");
  await prisma.wordRanking.deleteMany({});
  console.log("Existing data deleted");
}

async function main() {
  // await deleteExistingData();

  if ((await prisma.wordRanking.count()) > 0) {
    console.log("Data already exists. Skip seeding");
    return;
  }

  const filePath = path.join(__dirname, "en-de-words-ranking.json");
  const wordsData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  console.log(`Found ${wordsData.length} words to import`);

  const batchSize = 100;
  for (let i = 0; i < wordsData.length; i += batchSize) {
    const batch = wordsData.slice(i, i + batchSize);

    const records = batch.map((word, index) => ({
      source_language: "en",
      target_language: "de",
      word: word.word,
      translation: word.translation,
      frequencyRank: i + index + 1,
    }));

    await prisma.wordRanking.createMany({
      data: records,
      skipDuplicates: true,
    });

    console.log(`Processed ${i + batch.length} of ${wordsData.length} words`);
  }

  console.log("Word ranking import completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
