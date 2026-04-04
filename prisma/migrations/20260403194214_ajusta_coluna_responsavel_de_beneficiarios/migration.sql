/*
  Warnings:

  - The values [Não] on the enum `Responsavel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Responsavel_new" AS ENUM ('Sim', 'Nao');
ALTER TABLE "beneficiarios" ALTER COLUMN "responsavel" TYPE "Responsavel_new" USING ("responsavel"::text::"Responsavel_new");
ALTER TYPE "Responsavel" RENAME TO "Responsavel_old";
ALTER TYPE "Responsavel_new" RENAME TO "Responsavel";
DROP TYPE "public"."Responsavel_old";
COMMIT;
