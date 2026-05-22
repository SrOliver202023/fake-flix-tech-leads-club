-- DropForeignKey
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_thumbnailId_fkey";

-- AlterTable
ALTER TABLE "Movie" ALTER COLUMN "thumbnailId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Movie" ADD CONSTRAINT "Movie_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "Thumbnail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
