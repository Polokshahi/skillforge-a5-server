/*
  Warnings:

  - The `completedLessons` column on the `enrollments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "enrollments" DROP COLUMN "completedLessons",
ADD COLUMN     "completedLessons" JSONB;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
