/*
  Warnings:

  - The values [FILHA,AVO] on the enum `Parentesco` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Parentesco_new" AS ENUM ('PAI', 'MAE', 'FILHO', 'AVÔ OU AVÓ', 'CÔNJUGE', 'RESPONSÁVEL', 'SOBRINHO', 'NETO', 'IRMÃO(A)', 'TIO', 'ENTEADO', 'NAO COLETADO', 'OUTRO');
ALTER TABLE "beneficiarios" ALTER COLUMN "parentesco" TYPE "Parentesco_new" USING ("parentesco"::text::"Parentesco_new");
ALTER TYPE "Parentesco" RENAME TO "Parentesco_old";
ALTER TYPE "Parentesco_new" RENAME TO "Parentesco";
DROP TYPE "public"."Parentesco_old";
COMMIT;

-- AlterEnum
ALTER TYPE "Sexo" ADD VALUE 'Outro/Não declarou';

-- DropForeignKey
ALTER TABLE "beneficiarios" DROP CONSTRAINT "beneficiarios_id_fkey";

-- DropForeignKey
ALTER TABLE "participations" DROP CONSTRAINT "participations_id_fkey";

-- AlterTable
ALTER TABLE "beneficiarios" ALTER COLUMN "cpf" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "beneficiarios" ADD CONSTRAINT "beneficiarios_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
