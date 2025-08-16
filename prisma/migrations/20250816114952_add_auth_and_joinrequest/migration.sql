/*
  Warnings:

  - You are about to drop the column `archivedAt` on the `MonthlyArchive` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[year,month]` on the table `MonthlyArchive` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[authId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- DropIndex
DROP INDEX "public"."MonthlyArchive_month_year_idx";

-- DropIndex
DROP INDEX "public"."MonthlyArchive_month_year_key";

-- AlterTable
ALTER TABLE "public"."MonthlyArchive" DROP COLUMN "archivedAt";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "authId" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "public"."JoinRequest" (
    "id" TEXT NOT NULL,
    "authId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JoinRequest_authId_key" ON "public"."JoinRequest"("authId");

-- CreateIndex
CREATE INDEX "MonthlyArchive_year_month_idx" ON "public"."MonthlyArchive"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyArchive_year_month_key" ON "public"."MonthlyArchive"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "User_authId_key" ON "public"."User"("authId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- RenameIndex (do it only if the old index exists to avoid shadow DB errors)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'BatchMeal_user_start_end_idx') THEN
    ALTER INDEX "public"."BatchMeal_user_start_end_idx" RENAME TO "BatchMeal_userId_startDate_endDate_idx";
  END IF;
END$$;
