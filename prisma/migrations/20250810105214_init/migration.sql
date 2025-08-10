-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Grocery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "item" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paid" BOOLEAN NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "Grocery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

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

-- CreateTable
CREATE TABLE "ExtraMeal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "ExtraMeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Grocery_date_idx" ON "Grocery"("date");

-- CreateIndex
CREATE INDEX "Grocery_userId_idx" ON "Grocery"("userId");

-- CreateIndex
CREATE INDEX "MealSchedule_userId_date_idx" ON "MealSchedule"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MealSchedule_userId_date_key" ON "MealSchedule"("userId", "date");

-- CreateIndex
CREATE INDEX "ExtraMeal_userId_date_idx" ON "ExtraMeal"("userId", "date");
