-- AlterTable
ALTER TABLE "Reuniao" DROP COLUMN "descricao",
DROP COLUMN "titulo",
ADD COLUMN     "igrejaId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Reuniao_igrejaId_idx" ON "Reuniao"("igrejaId");

-- CreateIndex
CREATE UNIQUE INDEX "Reuniao_igrejaId_data_key" ON "Reuniao"("igrejaId", "data");

-- AddForeignKey
ALTER TABLE "Reuniao" ADD CONSTRAINT "Reuniao_igrejaId_fkey" FOREIGN KEY ("igrejaId") REFERENCES "IgrejaCasa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

