-- Track seniority per (person, area) instead of a single global veterano flag
CREATE TYPE "NivelMidia" AS ENUM ('TREINEIRO', 'VETERANO');

ALTER TABLE "User" ADD COLUMN "areaSolicitadaMidia" "AreaMidia";

CREATE TABLE "AreaMidiaServo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "area" "AreaMidia" NOT NULL,
    "nivel" "NivelMidia" NOT NULL DEFAULT 'TREINEIRO',

    CONSTRAINT "AreaMidiaServo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AreaMidiaServo_userId_area_key" ON "AreaMidiaServo"("userId", "area");

ALTER TABLE "AreaMidiaServo" ADD CONSTRAINT "AreaMidiaServo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
