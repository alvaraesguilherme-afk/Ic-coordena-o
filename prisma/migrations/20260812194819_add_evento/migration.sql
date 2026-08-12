-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "redeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_redeId_fkey" FOREIGN KEY ("redeId") REFERENCES "Rede"("id") ON DELETE CASCADE ON UPDATE CASCADE;
