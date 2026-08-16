-- AlterTable
ALTER TABLE "User" ADD COLUMN "tutoriaisVistos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
