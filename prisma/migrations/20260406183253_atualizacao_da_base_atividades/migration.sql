/*
  Warnings:

  - You are about to drop the `activities` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Dimensao" AS ENUM ('EDUCACÃO', 'SAÚDE', 'MORADIA_ÁGUA_ENERGIA', 'DESENVOLVIMENTO_ECONOMICO', 'NUTRIÇÃO');

-- CreateEnum
CREATE TYPE "Projeto" AS ENUM ('REDE+', 'PROA');

-- CreateEnum
CREATE TYPE "TipoAtividade" AS ENUM ('ATENDIMENTO', 'ATIVIDADE');

-- CreateEnum
CREATE TYPE "FormatoAtividade" AS ENUM ('INDIVIDUAL', 'GRUPO');

-- DropForeignKey
ALTER TABLE "participations" DROP CONSTRAINT "participations_activity_id_fkey";

-- DropTable
DROP TABLE "activities";

-- DropEnum
DROP TYPE "ActivityFormat";

-- DropEnum
DROP TYPE "ActivityType";

-- CreateTable
CREATE TABLE "acoes" (
    "id" TEXT NOT NULL,
    "nome_acao" TEXT NOT NULL,
    "descricao" TEXT,
    "dimensao" "Dimensao" NOT NULL,
    "projeto" "Projeto" NOT NULL,
    "tipo_de_acao" "TipoAtividade" NOT NULL,
    "formato_da_atividade" "FormatoAtividade" NOT NULL,
    "local" TEXT NOT NULL,
    "semestre" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "acoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
