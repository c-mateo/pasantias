/*
  Warnings:

  - A unique constraint covering the columns `[documentId,draftId]` on the table `DocumentAttachment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[documentId,applicationId]` on the table `DocumentAttachment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DocumentAttachment" DROP CONSTRAINT "DocumentAttachment_draftId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "DocumentAttachment_documentId_draftId_key" ON "DocumentAttachment"("documentId", "draftId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentAttachment_documentId_applicationId_key" ON "DocumentAttachment"("documentId", "applicationId");

-- AddForeignKey
ALTER TABLE "DocumentAttachment" ADD CONSTRAINT "DocumentAttachment_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ApplicationDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
