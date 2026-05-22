/*
  Warnings:

  - You are about to drop the column `movieId` on the `Video` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[videoId]` on the table `Movie` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `videoId` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_movieId_fkey";

-- DropIndex
DROP INDEX "Video_movieId_key";

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "videoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "movieId";

-- CreateIndex
CREATE UNIQUE INDEX "Movie_videoId_key" ON "Movie"("videoId");

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
