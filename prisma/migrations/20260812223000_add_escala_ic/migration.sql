-- AlterTable
ALTER TABLE "User" ADD COLUMN "supervisorIntegracao" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "supervisorIntercessao" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EscalaIcEntrada" (
    "id" TEXT NOT NULL,
    "tipo" "TipoEscala" NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "vaga" INTEGER NOT NULL,
    "liderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EscalaIcEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EscalaIcEntrada_liderId_idx" ON "EscalaIcEntrada"("liderId");

-- CreateIndex
CREATE INDEX "EscalaIcEntrada_data_idx" ON "EscalaIcEntrada"("data");

-- CreateIndex
CREATE UNIQUE INDEX "EscalaIcEntrada_tipo_data_vaga_key" ON "EscalaIcEntrada"("tipo", "data", "vaga");

-- AddForeignKey
ALTER TABLE "EscalaIcEntrada" ADD CONSTRAINT "EscalaIcEntrada_liderId_fkey" FOREIGN KEY ("liderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
