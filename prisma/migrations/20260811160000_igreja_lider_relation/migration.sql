-- AlterTable
ALTER TABLE "IgrejaCasa" ADD COLUMN     "liderId" TEXT;
ALTER TABLE "IgrejaCasa" DROP COLUMN "liderNome";

-- AddForeignKey
ALTER TABLE "IgrejaCasa" ADD CONSTRAINT "IgrejaCasa_liderId_fkey" FOREIGN KEY ("liderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
