/*
  Warnings:

  - You are about to drop the column `exampleSentence` on the `UserVocabulary` table. All the data in the column will be lost.
  - You are about to drop the column `exampleSentenceTranslation` on the `UserVocabulary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserVocabulary" DROP COLUMN "exampleSentence",
DROP COLUMN "exampleSentenceTranslation";
