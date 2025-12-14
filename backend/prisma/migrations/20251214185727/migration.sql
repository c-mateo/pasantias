/*
  Warnings:

  - You are about to drop the column `dni` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cuilHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_dni_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "dni",
ADD COLUMN     "cuil" TEXT,
ADD COLUMN     "cuilHash" VARCHAR(64);

-- CreateIndex
CREATE UNIQUE INDEX "User_cuilHash_key" ON "User"("cuilHash");
