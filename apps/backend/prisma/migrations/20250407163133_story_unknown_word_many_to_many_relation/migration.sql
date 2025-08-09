/*
  Warnings:

  - You are about to drop the column `storyId` on the `UnknownWord` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UnknownWord" DROP CONSTRAINT "UnknownWord_storyId_fkey";

-- AlterTable
ALTER TABLE "UnknownWord" DROP COLUMN "storyId";

-- CreateTable
CREATE TABLE "_StoryToUnknownWord" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StoryToUnknownWord_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_StoryToUnknownWord_B_index" ON "_StoryToUnknownWord"("B");

-- AddForeignKey
ALTER TABLE "_StoryToUnknownWord" ADD CONSTRAINT "_StoryToUnknownWord_A_fkey" FOREIGN KEY ("A") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StoryToUnknownWord" ADD CONSTRAINT "_StoryToUnknownWord_B_fkey" FOREIGN KEY ("B") REFERENCES "UnknownWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
