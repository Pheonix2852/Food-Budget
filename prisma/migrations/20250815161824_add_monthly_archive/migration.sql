/*
  Warnings:

  - You are about to drop the `ExtraMealArchive` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroceryArchive` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MealScheduleArchive` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."ExtraMealArchive";

-- DropTable
DROP TABLE "public"."GroceryArchive";

-- DropTable
DROP TABLE "public"."MealScheduleArchive";

-- CreateTable
CREATE TABLE "public"."MonthlyArchive" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyArchive_month_year_idx" ON "public"."MonthlyArchive"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyArchive_month_year_key" ON "public"."MonthlyArchive"("month", "year");
