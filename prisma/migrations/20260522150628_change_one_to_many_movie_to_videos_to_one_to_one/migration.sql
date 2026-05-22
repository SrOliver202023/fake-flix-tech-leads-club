/*
  Warnings:

  - A unique constraint covering the columns `[movieId]` on the table `Video` will be added. If there are existing duplicate values, this will fail.
  - Made the column `movieId` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_movieId_fkey";

-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "movieId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Video_movieId_key" ON "Video"("movieId");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
