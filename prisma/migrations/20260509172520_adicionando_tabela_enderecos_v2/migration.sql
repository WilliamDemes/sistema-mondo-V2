/*
  Warnings:

  - The values [CIDADE NOVA l] on the enum `Bairro` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Bairro_new" AS ENUM ('SÃO PEDRO', 'AEROPORTO', 'BANDEIRANTES', 'CASTANHEIRA', 'JARDIM TROPICAL', 'CENTRO', 'CIDADE NOVA', 'CIDADE NOVA ll', 'CORCOVADO', 'JESUS MISERICORDIOSO', 'NOVA BREVES', 'PA 159', 'PARQUE UNIVERSITÁRIO', 'RIACHO DOCE', 'SANTA CRUZ', 'SÃO TOMÉ', 'RIO PARAUAÚ');
ALTER TABLE "public"."enderecos" ALTER COLUMN "bairro" DROP DEFAULT;
ALTER TABLE "enderecos" ALTER COLUMN "bairro" TYPE "Bairro_new" USING ("bairro"::text::"Bairro_new");
ALTER TYPE "Bairro" RENAME TO "Bairro_old";
ALTER TYPE "Bairro_new" RENAME TO "Bairro";
DROP TYPE "public"."Bairro_old";
ALTER TABLE "enderecos" ALTER COLUMN "bairro" SET DEFAULT 'CENTRO';
COMMIT;
