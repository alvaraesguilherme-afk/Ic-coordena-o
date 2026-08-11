/*
  Warnings:

  - You are about to drop the `EscalaIntercessao` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoEscala" AS ENUM ('INTERCESSAO', 'INTEGRACAO', 'MIDIA');

-- DropForeignKey
ALTER TABLE "EscalaParticipante" DROP CONSTRAINT "EscalaParticipante_escalaId_fkey";

-- DropTable
DROP TABLE "EscalaIntercessao";

-- CreateTable
CREATE TABLE "Escala" (
    "id" TEXT NOT NULL,
    "tipo" "TipoEscala" NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Escala_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EscalaParticipante" ADD CONSTRAINT "EscalaParticipante_escalaId_fkey" FOREIGN KEY ("escalaId") REFERENCES "Escala"("id") ON DELETE CASCADE ON UPDATE CASCADE;
