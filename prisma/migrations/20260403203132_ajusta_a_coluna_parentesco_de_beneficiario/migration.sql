/*
  Warnings:

  - The values [INDÍGENA] on the enum `Cor` will be removed. If these variants are still used in the database, this will fail.
  - The values [AVÔ OU AVÓ,RESPONSÁVEL,IRMÃO(A)] on the enum `Parentesco` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Cor_new" AS ENUM ('BRANCO', 'PRETO', 'PARDO', 'INDIGENA', 'AMARELO');
ALTER TABLE "beneficiarios" ALTER COLUMN "cor" TYPE "Cor_new" USING ("cor"::text::"Cor_new");
ALTER TYPE "Cor" RENAME TO "Cor_old";
ALTER TYPE "Cor_new" RENAME TO "Cor";
DROP TYPE "public"."Cor_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Parentesco_new" AS ENUM ('PAI', 'MAE', 'FILHO', 'AVO', 'CONJUGE', 'RESPONSAVEL', 'SOBRINHO', 'NETO', 'IRMAO', 'TIO', 'ENTEADO', 'NAO COLETADO', 'OUTRO');
ALTER TABLE "beneficiarios" ALTER COLUMN "parentesco" TYPE "Parentesco_new" USING ("parentesco"::text::"Parentesco_new");
ALTER TYPE "Parentesco" RENAME TO "Parentesco_old";
ALTER TYPE "Parentesco_new" RENAME TO "Parentesco";
DROP TYPE "public"."Parentesco_old";
COMMIT;
