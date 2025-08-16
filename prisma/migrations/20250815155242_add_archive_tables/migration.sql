-- CreateTable
CREATE TABLE "public"."GroceryArchive" (
    "id" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paid" BOOLEAN NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroceryArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MealScheduleArchive" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "breakfast" BOOLEAN NOT NULL,
    "lunch" BOOLEAN NOT NULL,
    "dinner" BOOLEAN NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealScheduleArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExtraMealArchive" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtraMealArchive_pkey" PRIMARY KEY ("id")
);
