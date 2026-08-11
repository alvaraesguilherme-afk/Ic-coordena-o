/*
  Warnings:

  - Added the required column `redeId` to the `IgrejaCasa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "IgrejaCasa" ADD COLUMN     "redeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Rede" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "liderNome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rede_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IgrejaCasa" ADD CONSTRAINT "IgrejaCasa_redeId_fkey" FOREIGN KEY ("redeId") REFERENCES "Rede"("id") ON DELETE CASCADE ON UPDATE CASCADE;
