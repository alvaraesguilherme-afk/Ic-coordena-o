-- Marca uma reunião como "não houve" (semana cancelada), sem apagar o registro.
ALTER TABLE "Reuniao" ADD COLUMN "cancelada" BOOLEAN NOT NULL DEFAULT false;
