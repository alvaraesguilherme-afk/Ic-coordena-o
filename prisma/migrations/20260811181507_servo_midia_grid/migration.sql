-- CreateEnum
CREATE TYPE "AreaMidia" AS ENUM ('PROJECAO', 'ILUMINACAO', 'STORIES', 'CAMERA_1', 'CAMERA_2', 'TRANSMISSAO', 'FOTOGRAFIA');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "areaMidia" "AreaMidia",
ADD COLUMN     "supervisorMidia" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EscalaMidiaEntrada" (
    "id" TEXT NOT NULL,
    "area" "AreaMidia" NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "escaladoId" TEXT NOT NULL,
    "treinandoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscalaMidiaEntrada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EscalaMidiaEntrada_area_data_key" ON "EscalaMidiaEntrada"("area", "data");

-- AddForeignKey
ALTER TABLE "EscalaMidiaEntrada" ADD CONSTRAINT "EscalaMidiaEntrada_escaladoId_fkey" FOREIGN KEY ("escaladoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalaMidiaEntrada" ADD CONSTRAINT "EscalaMidiaEntrada_treinandoId_fkey" FOREIGN KEY ("treinandoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
