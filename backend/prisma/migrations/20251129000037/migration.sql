/*
  Warnings:

  - You are about to drop the column `domicilio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `localidad` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `provincia` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_provincia_localidad_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "domicilio",
DROP COLUMN "localidad",
DROP COLUMN "provincia",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "province" VARCHAR(100);

-- CreateIndex
CREATE INDEX "User_province_city_idx" ON "User"("province", "city");
