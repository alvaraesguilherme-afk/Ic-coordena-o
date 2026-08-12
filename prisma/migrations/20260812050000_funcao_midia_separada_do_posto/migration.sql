-- Servo function is separate from grid slot: "Câmera 1"/"Câmera 2" stay as
-- two physical slots on the schedule (AreaMidia), but a person's function
-- is just "Câmera" (FuncaoMidia) — they can be placed on either slot.
CREATE TYPE "FuncaoMidia" AS ENUM ('PROJECAO', 'ILUMINACAO', 'STORIES', 'CAMERA', 'TRANSMISSAO', 'FOTOGRAFIA');

-- AreaMidiaServo.area: AreaMidia -> FuncaoMidia
ALTER TABLE "AreaMidiaServo" ADD COLUMN "funcao" "FuncaoMidia";
UPDATE "AreaMidiaServo" SET "funcao" = CASE
  WHEN "area"::text IN ('CAMERA_1', 'CAMERA_2') THEN 'CAMERA'::"FuncaoMidia"
  ELSE "area"::text::"FuncaoMidia"
END;
ALTER TABLE "AreaMidiaServo" ALTER COLUMN "funcao" SET NOT NULL;
DROP INDEX "AreaMidiaServo_userId_area_key";
ALTER TABLE "AreaMidiaServo" DROP COLUMN "area";
ALTER TABLE "AreaMidiaServo" RENAME COLUMN "funcao" TO "area";
CREATE UNIQUE INDEX "AreaMidiaServo_userId_area_key" ON "AreaMidiaServo"("userId", "area");

-- User.areaSolicitadaMidia: AreaMidia? -> FuncaoMidia?
ALTER TABLE "User" ADD COLUMN "funcaoSolicitadaMidia" "FuncaoMidia";
UPDATE "User" SET "funcaoSolicitadaMidia" = CASE
  WHEN "areaSolicitadaMidia"::text IN ('CAMERA_1', 'CAMERA_2') THEN 'CAMERA'::"FuncaoMidia"
  WHEN "areaSolicitadaMidia" IS NOT NULL THEN "areaSolicitadaMidia"::text::"FuncaoMidia"
  ELSE NULL
END;
ALTER TABLE "User" DROP COLUMN "areaSolicitadaMidia";
ALTER TABLE "User" RENAME COLUMN "funcaoSolicitadaMidia" TO "areaSolicitadaMidia";
