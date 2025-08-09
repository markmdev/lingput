/*
  Warnings:

  - A unique constraint covering the columns `[sessionUUID]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionUUID_key" ON "Session"("sessionUUID");
