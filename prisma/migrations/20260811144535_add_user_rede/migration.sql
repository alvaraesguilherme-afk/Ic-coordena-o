-- AlterTable
ALTER TABLE "User" ADD COLUMN     "redeId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_redeId_fkey" FOREIGN KEY ("redeId") REFERENCES "Rede"("id") ON DELETE SET NULL ON UPDATE CASCADE;
