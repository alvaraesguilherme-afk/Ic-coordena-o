-- AlterTable
ALTER TABLE "User" ADD COLUMN     "supervisorDirecaoCulto" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autorizadoDirecaoCulto" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EscalaCultoEntrada" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "escaladoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscalaCultoEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EscalaCultoEntrada_data_key" ON "EscalaCultoEntrada"("data");

-- AddForeignKey
ALTER TABLE "EscalaCultoEntrada" ADD CONSTRAINT "EscalaCultoEntrada_escaladoId_fkey" FOREIGN KEY ("escaladoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "GradeCultoMes" (
    "id" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "concluidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GradeCultoMes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GradeCultoMes_ano_mes_key" ON "GradeCultoMes"("ano", "mes");
