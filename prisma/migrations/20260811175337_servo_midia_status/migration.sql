-- CreateEnum
CREATE TYPE "ServoMidiaStatus" AS ENUM ('NENHUM', 'PENDENTE', 'APROVADO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "servoMidiaStatus" "ServoMidiaStatus" NOT NULL DEFAULT 'NENHUM';
