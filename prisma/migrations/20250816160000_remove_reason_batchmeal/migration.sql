-- Drop the optional `reason` column from BatchMeal
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'BatchMeal'
	) THEN
		ALTER TABLE "public"."BatchMeal" DROP COLUMN IF EXISTS "reason";
	END IF;
END$$;
