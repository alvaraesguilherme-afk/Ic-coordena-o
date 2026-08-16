-- CreateTable
CREATE TABLE "RelatorioEscalaIc" (
    "id" TEXT NOT NULL,
    "tipo" "TipoEscala" NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "visitantes" INTEGER NOT NULL,
    "presentes" INTEGER NOT NULL,
    "novosConvertidos" INTEGER NOT NULL,
    "enviadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelatorioEscalaIc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RelatorioEscalaIc_tipo_data_key" ON "RelatorioEscalaIc"("tipo", "data");

-- CreateIndex
CREATE INDEX "RelatorioEscalaIc_enviadoPorId_idx" ON "RelatorioEscalaIc"("enviadoPorId");

-- AddForeignKey
ALTER TABLE "RelatorioEscalaIc" ADD CONSTRAINT "RelatorioEscalaIc_enviadoPorId_fkey" FOREIGN KEY ("enviadoPorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
