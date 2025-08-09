-- CreateEnum
CREATE TYPE "WordStatus" AS ENUM ('learning', 'learned');

-- CreateTable
CREATE TABLE "Story" (
    "id" SERIAL NOT NULL,
    "storyText" TEXT NOT NULL,
    "translationText" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnknownWord" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "article" TEXT,
    "exampleSentence" TEXT NOT NULL,
    "exampleSentenceTranslation" TEXT NOT NULL,
    "timesSeen" INTEGER NOT NULL DEFAULT 1,
    "status" "WordStatus" NOT NULL DEFAULT 'learning',
    "storyId" INTEGER NOT NULL,

    CONSTRAINT "UnknownWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVocabulary" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "article" TEXT,
    "exampleSentence" TEXT,
    "exampleSentenceTranslation" TEXT,

    CONSTRAINT "UserVocabulary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UnknownWord" ADD CONSTRAINT "UnknownWord_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
