/*
  Warnings:

  - The values [REVIEWING] on the enum `ApplicationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `acceptedAt` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `appliedAt` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `rejectedAt` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedAt` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Application` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationStatus_new" AS ENUM ('PENDING', 'BLOCKED', 'ACCEPTED', 'REJECTED', 'CANCELLED');
ALTER TABLE "public"."Application" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus_new" USING ("status"::text::"ApplicationStatus_new");
ALTER TYPE "ApplicationStatus" RENAME TO "ApplicationStatus_old";
ALTER TYPE "ApplicationStatus_new" RENAME TO "ApplicationStatus";
DROP TYPE "public"."ApplicationStatus_old";
ALTER TABLE "Application" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "Application_appliedAt_idx";

-- DropIndex
DROP INDEX "Application_status_updatedAt_idx";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "acceptedAt",
DROP COLUMN "appliedAt",
DROP COLUMN "endDate",
DROP COLUMN "rejectedAt",
DROP COLUMN "reviewedAt",
DROP COLUMN "startDate";

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "durationWeeks" INTEGER,
ADD COLUMN     "location" VARCHAR(200),
ADD COLUMN     "salary" INTEGER,
ADD COLUMN     "startDate" TIMESTAMP(3);
