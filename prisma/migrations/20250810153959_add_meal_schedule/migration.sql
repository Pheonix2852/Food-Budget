/*
  Warnings:

  - You are about to drop the `Schedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Schedule";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "MealSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "breakfast" BOOLEAN NOT NULL DEFAULT true,
    "lunch" BOOLEAN NOT NULL DEFAULT true,
    "dinner" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "MealSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Grocery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "item" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paid" BOOLEAN NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "Grocery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Grocery" ("amount", "date", "id", "item", "paid", "userId") SELECT "amount", "date", "id", "item", "paid", "userId" FROM "Grocery";
DROP TABLE "Grocery";
ALTER TABLE "new_Grocery" RENAME TO "Grocery";
CREATE INDEX "Grocery_date_idx" ON "Grocery"("date");
CREATE INDEX "Grocery_userId_idx" ON "Grocery"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MealSchedule_userId_date_key" ON "MealSchedule"("userId", "date");

-- CreateIndex
CREATE INDEX "ExtraMeal_userId_date_idx" ON "ExtraMeal"("userId", "date");
