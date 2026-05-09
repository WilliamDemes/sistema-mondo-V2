/*
  Warnings:

  - The primary key for the `acompanhamento_familiar` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `acompanhamento_familiar` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Bairro" AS ENUM ('SÃO PEDRO', 'AEROPORTO', 'BANDEIRANTES', 'CASTANHEIRA', 'JARDIM TROPICAL', 'CENTRO', 'CIDADE NOVA l', 'CIDADE NOVA ll', 'CORCOVADO', 'JESUS MISERICORDIOSO', 'NOVA BREVES', 'PA 159', 'PARQUE UNIVERSITÁRIO', 'RIACHO DOCE', 'SANTA CRUZ', 'SÃO TOMÉ', 'RIO PARAUAÚ');

-- CreateEnum
CREATE TYPE "Perimetro" AS ENUM ('RURAL', 'URBANO', 'RIBEIRINHO');

-- AlterTable
ALTER TABLE "acompanhamento_familiar" DROP CONSTRAINT "acompanhamento_familiar_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "acompanhamento_familiar_pkey" PRIMARY KEY ("idFamilia");

-- CreateTable
CREATE TABLE "enderecos" (
    "id_sistema" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "id_familia" TEXT NOT NULL,
    "rua_rio" TEXT NOT NULL,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" "Bairro" NOT NULL DEFAULT 'CENTRO',
    "perimetro" "Perimetro" NOT NULL DEFAULT 'URBANO',

    CONSTRAINT "enderecos_pkey" PRIMARY KEY ("id_sistema")
);

-- AddForeignKey
ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_id_familia_fkey" FOREIGN KEY ("id_familia") REFERENCES "familias"("id_familia") ON DELETE CASCADE ON UPDATE CASCADE;
