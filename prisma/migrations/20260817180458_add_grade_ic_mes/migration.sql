-- CreateTable
CREATE TABLE "GradeIcMes" (
    "id" TEXT NOT NULL,
    "tipo" "TipoEscala" NOT NULL,
    "ano" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "concluidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GradeIcMes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GradeIcMes_tipo_ano_mes_key" ON "GradeIcMes"("tipo", "ano", "mes");
