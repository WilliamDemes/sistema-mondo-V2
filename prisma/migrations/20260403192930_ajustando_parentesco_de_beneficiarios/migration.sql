/*
  Warnings:

  - The values [NAO COLETADO] on the enum `Parentesco` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Parentesco_new" AS ENUM ('PAI', 'MAE', 'FILHO', 'AVÔ OU AVÓ', 'CÔNJUGE', 'RESPONSÁVEL', 'SOBRINHO', 'NETO', 'IRMÃO(A)', 'TIO', 'ENTEADO', 'NÃO COLETADO', 'OUTRO');
ALTER TABLE "beneficiarios" ALTER COLUMN "parentesco" TYPE "Parentesco_new" USING ("parentesco"::text::"Parentesco_new");
ALTER TYPE "Parentesco" RENAME TO "Parentesco_old";
ALTER TYPE "Parentesco_new" RENAME TO "Parentesco";
DROP TYPE "public"."Parentesco_old";
COMMIT;
