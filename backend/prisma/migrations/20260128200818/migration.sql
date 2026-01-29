/*
  Warnings:

  - You are about to drop the column `relatedId` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `tag` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "relatedId",
ADD COLUMN     "clickUrl" VARCHAR(200),
ADD COLUMN     "tag" VARCHAR(100) NOT NULL;
