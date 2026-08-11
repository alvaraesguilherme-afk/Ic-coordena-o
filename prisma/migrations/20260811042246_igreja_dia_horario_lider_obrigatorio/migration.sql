/*
  Warnings:

  - Added the required column `diaSemana` to the `IgrejaCasa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `horario` to the `IgrejaCasa` table without a default value. This is not possible if the table is not empty.
  - Made the column `liderNome` on table `IgrejaCasa` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO');

-- AlterTable
ALTER TABLE "IgrejaCasa" ADD COLUMN     "diaSemana" "DiaSemana" NOT NULL,
ADD COLUMN     "horario" TEXT NOT NULL,
ALTER COLUMN "liderNome" SET NOT NULL;
