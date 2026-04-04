/*
  Warnings:

  - The values [Outro/Não declarou] on the enum `Sexo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Sexo_new" AS ENUM ('Masculino', 'Feminino', 'Outro/Nao declarou');
ALTER TABLE "beneficiarios" ALTER COLUMN "sexo" TYPE "Sexo_new" USING ("sexo"::text::"Sexo_new");
ALTER TYPE "Sexo" RENAME TO "Sexo_old";
ALTER TYPE "Sexo_new" RENAME TO "Sexo";
DROP TYPE "public"."Sexo_old";
COMMIT;
