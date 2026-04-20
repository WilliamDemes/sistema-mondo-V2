/*
  Warnings:

  - The primary key for the `acoes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `acoes` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `acoes` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `acoes` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_de_acao` on the `acoes` table. All the data in the column will be lost.
  - The primary key for the `beneficiarios` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `beneficiarios` table. All the data in the column will be lost.
  - You are about to drop the column `family_id` on the `beneficiarios` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `beneficiarios` table. All the data in the column will be lost.
  - You are about to drop the column `id_mondo_morador` on the `beneficiarios` table. All the data in the column will be lost.
  - The primary key for the `familias` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `familias` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `familias` table. All the data in the column will be lost.
  - You are about to drop the column `id_mondo_familia` on the `familias` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `familias` table. All the data in the column will be lost.
  - The primary key for the `participacoes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `acao_id` on the `participacoes` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `participacoes` table. All the data in the column will be lost.
  - You are about to drop the column `familia_id` on the `participacoes` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `participacoes` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_familia]` on the table `familias` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoria` to the `acoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data` to the `acoes` table without a default value. This is not possible if the table is not empty.
  - The required column `idAcao` was added to the `acoes` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `rubrica` to the `acoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_familia` to the `beneficiarios` table without a default value. This is not possible if the table is not empty.
  - The required column `id_sistema` was added to the `beneficiarios` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `sequencial_morador` to the `beneficiarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `atualizado_em` to the `familias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_familia` to the `familias` table without a default value. This is not possible if the table is not empty.
  - The required column `id_sistema` was added to the `familias` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `id_acao` to the `participacoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_familia` to the `participacoes` table without a default value. This is not possible if the table is not empty.
  - The required column `id_participacao` was added to the `participacoes` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `sequencial_morador` to the `participacoes` table without a default value. This is not possible if the table is not empty.
  - The required column `idSistema` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('ATENDIMENTO', 'ATIVIDADE');

-- DropForeignKey
ALTER TABLE "beneficiarios" DROP CONSTRAINT "beneficiarios_family_id_fkey";

-- DropForeignKey
ALTER TABLE "participacoes" DROP CONSTRAINT "participacoes_acao_id_fkey";

-- DropForeignKey
ALTER TABLE "participacoes" DROP CONSTRAINT "participacoes_familia_id_fkey";

-- AlterTable
ALTER TABLE "acoes" DROP CONSTRAINT "acoes_pkey",
DROP COLUMN "created_at",
DROP COLUMN "date",
DROP COLUMN "id",
DROP COLUMN "tipo_de_acao",
ADD COLUMN     "categoria" "Categoria" NOT NULL,
ADD COLUMN     "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "data" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "idAcao" TEXT NOT NULL,
ADD COLUMN     "metadados" JSONB,
ADD COLUMN     "rubrica" TEXT NOT NULL,
ADD CONSTRAINT "acoes_pkey" PRIMARY KEY ("idAcao");

-- AlterTable
ALTER TABLE "beneficiarios" DROP CONSTRAINT "beneficiarios_pkey",
DROP COLUMN "created_at",
DROP COLUMN "family_id",
DROP COLUMN "id",
DROP COLUMN "id_mondo_morador",
ADD COLUMN     "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_familia" TEXT NOT NULL,
ADD COLUMN     "id_sistema" TEXT NOT NULL,
ADD COLUMN     "sequencial_morador" TEXT NOT NULL,
ADD CONSTRAINT "beneficiarios_pkey" PRIMARY KEY ("id_sistema");

-- AlterTable
ALTER TABLE "familias" DROP CONSTRAINT "familias_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
DROP COLUMN "id_mondo_familia",
DROP COLUMN "updated_at",
ADD COLUMN     "atualizado_em" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_familia" TEXT NOT NULL,
ADD COLUMN     "id_sistema" TEXT NOT NULL,
ADD CONSTRAINT "familias_pkey" PRIMARY KEY ("id_sistema");

-- AlterTable
ALTER TABLE "participacoes" DROP CONSTRAINT "participacoes_pkey",
DROP COLUMN "acao_id",
DROP COLUMN "created_at",
DROP COLUMN "familia_id",
DROP COLUMN "id",
ADD COLUMN     "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_acao" TEXT NOT NULL,
ADD COLUMN     "id_familia" TEXT NOT NULL,
ADD COLUMN     "id_participacao" TEXT NOT NULL,
ADD COLUMN     "sequencial_morador" TEXT NOT NULL,
ADD CONSTRAINT "participacoes_pkey" PRIMARY KEY ("id_participacao");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
ADD COLUMN     "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "idSistema" TEXT NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("idSistema");

-- DropEnum
DROP TYPE "TipoAtividade";

-- CreateIndex
CREATE UNIQUE INDEX "familias_id_familia_key" ON "familias"("id_familia");

-- AddForeignKey
ALTER TABLE "beneficiarios" ADD CONSTRAINT "beneficiarios_id_familia_fkey" FOREIGN KEY ("id_familia") REFERENCES "familias"("id_familia") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participacoes" ADD CONSTRAINT "participacoes_id_familia_fkey" FOREIGN KEY ("id_familia") REFERENCES "familias"("id_familia") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participacoes" ADD CONSTRAINT "participacoes_id_acao_fkey" FOREIGN KEY ("id_acao") REFERENCES "acoes"("idAcao") ON DELETE CASCADE ON UPDATE CASCADE;
