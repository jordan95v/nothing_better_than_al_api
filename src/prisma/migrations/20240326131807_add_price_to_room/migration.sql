/*
  Warnings:

  - You are about to drop the column `basePrice` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `basePrice` to the `rooms` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_filmId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_roomId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_userId_fkey";

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "basePrice" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "basePrice";

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_filmId_fkey" FOREIGN KEY ("filmId") REFERENCES "films"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
