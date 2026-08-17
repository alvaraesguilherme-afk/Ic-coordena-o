-- CreateEnum
CREATE TYPE "PermutaMidiaStatus" AS ENUM ('ABERTA', 'ACEITA', 'CANCELADA');

-- CreateTable
CREATE TABLE "PermutaMidia" (
    "id" TEXT NOT NULL,
    "entradaId" TEXT NOT NULL,
    "solicitanteId" TEXT NOT NULL,
    "status" "PermutaMidiaStatus" NOT NULL DEFAULT 'ABERTA',
    "aceitoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondidoEm" TIMESTAMP(3),

    CONSTRAINT "PermutaMidia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PermutaMidia_entradaId_idx" ON "PermutaMidia"("entradaId");

-- CreateIndex
CREATE INDEX "PermutaMidia_status_idx" ON "PermutaMidia"("status");

-- CreateIndex
CREATE INDEX "PermutaMidia_solicitanteId_idx" ON "PermutaMidia"("solicitanteId");

-- AddForeignKey
ALTER TABLE "PermutaMidia" ADD CONSTRAINT "PermutaMidia_entradaId_fkey" FOREIGN KEY ("entradaId") REFERENCES "EscalaMidiaEntrada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermutaMidia" ADD CONSTRAINT "PermutaMidia_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermutaMidia" ADD CONSTRAINT "PermutaMidia_aceitoPorId_fkey" FOREIGN KEY ("aceitoPorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
