-- Convert User.areaMidia (single, nullable) into User.areasMidia (array), preserving existing data
ALTER TABLE "User" ADD COLUMN "areasMidia" "AreaMidia"[] NOT NULL DEFAULT ARRAY[]::"AreaMidia"[];

UPDATE "User" SET "areasMidia" = ARRAY["areaMidia"] WHERE "areaMidia" IS NOT NULL;

ALTER TABLE "User" DROP COLUMN "areaMidia";
