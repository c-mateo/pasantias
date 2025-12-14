/*
  Warnings:

  - You are about to drop the column `anonymizedAt` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `city` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `province` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "anonymizedAt",
ALTER COLUMN "city" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "province" SET DATA TYPE VARCHAR(100);
