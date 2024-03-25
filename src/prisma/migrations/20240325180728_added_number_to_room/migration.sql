/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `rooms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `number` to the `rooms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "number" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "rooms_number_key" ON "rooms"("number");
