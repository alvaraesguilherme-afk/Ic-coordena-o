-- CreateIndex
CREATE INDEX "User_redeId_idx" ON "User"("redeId");

-- CreateIndex
CREATE INDEX "User_igrejaId_idx" ON "User"("igrejaId");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "Evento_redeId_data_idx" ON "Evento"("redeId", "data");

-- CreateIndex
CREATE INDEX "IgrejaCasa_redeId_idx" ON "IgrejaCasa"("redeId");

-- CreateIndex
CREATE INDEX "IgrejaCasa_liderId_idx" ON "IgrejaCasa"("liderId");

-- CreateIndex
CREATE INDEX "Escala_data_idx" ON "Escala"("data");

-- CreateIndex
CREATE INDEX "EscalaParticipante_userId_idx" ON "EscalaParticipante"("userId");

-- CreateIndex
CREATE INDEX "EscalaMidiaEntrada_escaladoId_idx" ON "EscalaMidiaEntrada"("escaladoId");

-- CreateIndex
CREATE INDEX "EscalaMidiaEntrada_treinandoId_idx" ON "EscalaMidiaEntrada"("treinandoId");

-- CreateIndex
CREATE INDEX "EscalaMidiaEntrada_data_idx" ON "EscalaMidiaEntrada"("data");
