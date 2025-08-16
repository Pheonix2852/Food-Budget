-- CreateTable
CREATE TABLE "public"."DisabledMeal" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DisabledMeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DisabledMeal_date_idx" ON "public"."DisabledMeal"("date");

-- CreateIndex
CREATE INDEX "DisabledMeal_type_idx" ON "public"."DisabledMeal"("type");

-- RenameIndex
ALTER INDEX "public"."BatchMeal_user_start_end_idx" RENAME TO "BatchMeal_userId_startDate_endDate_idx";
