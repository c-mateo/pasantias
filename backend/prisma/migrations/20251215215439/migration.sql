/*
  Warnings:

  - You are about to drop the `AuthToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('PASSWORD_RESET', 'EMAIL_CHANGE', 'EMAIL_VERIFY');

-- DropForeignKey
ALTER TABLE "AuthToken" DROP CONSTRAINT "AuthToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "AuthToken";

-- DropTable
DROP TABLE "Session";

-- DropEnum
DROP TYPE "AuthTokenType";

-- CreateTable
CREATE TABLE "UserToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "TokenType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "metadata" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserToken_tokenHash_key" ON "UserToken"("tokenHash");

-- CreateIndex
CREATE INDEX "UserToken_userId_type_idx" ON "UserToken"("userId", "type");

-- CreateIndex
CREATE INDEX "UserToken_expiresAt_idx" ON "UserToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "UserToken" ADD CONSTRAINT "UserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
