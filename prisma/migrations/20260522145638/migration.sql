/*
  Warnings:

  - A unique constraint covering the columns `[contentId]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contentId]` on the table `TvShow` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Movie_contentId_key" ON "Movie"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "TvShow_contentId_key" ON "TvShow"("contentId");
