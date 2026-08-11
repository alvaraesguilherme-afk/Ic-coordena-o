-- AlterTable
ALTER TABLE "User" ADD COLUMN     "igrejaId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "IgrejaCasa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
