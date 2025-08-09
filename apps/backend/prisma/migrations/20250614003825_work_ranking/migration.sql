-- CreateTable
CREATE TABLE "WordRanking" (
    "id" SERIAL NOT NULL,
    "source_language" TEXT NOT NULL,
    "target_language" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "frequencyRank" INTEGER NOT NULL,

    CONSTRAINT "WordRanking_pkey" PRIMARY KEY ("id")
);
