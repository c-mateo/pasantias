/*
  Warnings:

  - You are about to drop the column `fileSize` on the `Document` table. All the data in the column will be lost.
  - Added the required column `hash` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "fileSize",
ADD COLUMN     "hash" VARCHAR(64) NOT NULL,
ADD COLUMN     "hiddenAt" TIMESTAMP(3);
