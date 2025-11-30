/*
  Warnings:

  - The primary key for the `ApplicationDraft` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `externalId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Skill` table. All the data in the column will be lost.
  - You are about to drop the `ApplicationDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DraftDocument` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,offerId]` on the table `ApplicationDraft` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ApplicationDocument" DROP CONSTRAINT "ApplicationDocument_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationDocument" DROP CONSTRAINT "ApplicationDocument_documentId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationDocument" DROP CONSTRAINT "ApplicationDocument_offerId_documentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "DraftDocument" DROP CONSTRAINT "DraftDocument_documentId_fkey";

-- DropForeignKey
ALTER TABLE "DraftDocument" DROP CONSTRAINT "DraftDocument_offerId_documentTypeId_fkey";

-- DropForeignKey
ALTER TABLE "DraftDocument" DROP CONSTRAINT "DraftDocument_userId_offerId_fkey";

-- AlterTable
ALTER TABLE "ApplicationDraft" DROP CONSTRAINT "ApplicationDraft_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ApplicationDraft_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "externalId",
DROP COLUMN "verifiedAt";

-- AlterTable
ALTER TABLE "Skill" DROP COLUMN "category";

-- DropTable
DROP TABLE "ApplicationDocument";

-- DropTable
DROP TABLE "DraftDocument";

-- CreateTable
CREATE TABLE "DocumentAttachment" (
    "id" TEXT NOT NULL,
    "documentId" INTEGER NOT NULL,
    "draftId" INTEGER,
    "applicationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentAttachment_draftId_idx" ON "DocumentAttachment"("draftId");

-- CreateIndex
CREATE INDEX "DocumentAttachment_applicationId_idx" ON "DocumentAttachment"("applicationId");

-- CreateIndex
CREATE INDEX "DocumentAttachment_documentId_idx" ON "DocumentAttachment"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationDraft_userId_offerId_key" ON "ApplicationDraft"("userId", "offerId");

-- AddForeignKey
ALTER TABLE "DocumentAttachment" ADD CONSTRAINT "DocumentAttachment_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAttachment" ADD CONSTRAINT "DocumentAttachment_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ApplicationDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAttachment" ADD CONSTRAINT "DocumentAttachment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
