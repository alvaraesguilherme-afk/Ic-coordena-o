-- CreateEnum
CREATE TYPE "CategoriaLink" AS ENUM ('DRIVES_ESCOLA_IMPULSE', 'MINISTRACOES', 'EVENTOS');

-- AlterTable
ALTER TABLE "LinkUtil" ADD COLUMN     "categoria" "CategoriaLink" NOT NULL;

-- CreateIndex
CREATE INDEX "LinkUtil_categoria_idx" ON "LinkUtil"("categoria");
