-- Create BatchMeal table without reason column
CREATE TABLE "public"."BatchMeal" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BatchMeal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BatchMeal_user_start_end_idx" ON "public"."BatchMeal" ("userId", "startDate", "endDate");

ALTER TABLE "public"."BatchMeal" ADD CONSTRAINT "BatchMeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
