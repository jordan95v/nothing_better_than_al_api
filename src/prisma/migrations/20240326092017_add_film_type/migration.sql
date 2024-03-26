/*
  Warnings:

  - Added the required column `type` to the `films` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FilmType" AS ENUM ('ACTION', 'ADVENTURE', 'COMEDY', 'DRAMA', 'FANTASY', 'HORROR', 'MYSTERY', 'ROMANCE', 'THRILLER');

-- AlterTable
ALTER TABLE "films" ADD COLUMN     "type" "FilmType" NOT NULL;
