-- CreateEnum
CREATE TYPE "CategoriaLink" AS ENUM ('DRIVES_ESCOLA_IMPULSE', 'MINISTRACOES', 'EVENTOS');

-- CreateTable
CREATE TABLE "LinkUtil" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "categoria" "CategoriaLink" NOT NULL,
    "autorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkUtil_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkUtil_categoria_idx" ON "LinkUtil"("categoria");

-- AddForeignKey
ALTER TABLE "LinkUtil" ADD CONSTRAINT "LinkUtil_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
