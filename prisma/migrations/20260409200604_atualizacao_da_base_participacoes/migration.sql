/*
  Warnings:

  - You are about to drop the `participations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "participations" DROP CONSTRAINT "participations_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "participations" DROP CONSTRAINT "participations_family_id_fkey";

-- DropTable
DROP TABLE "participations";

-- CreateTable
CREATE TABLE "participacoes" (
    "id" TEXT NOT NULL,
    "familia_id" TEXT NOT NULL,
    "acao_id" TEXT NOT NULL,
    "contagem_de_participantes" INTEGER NOT NULL DEFAULT 1,
    "Observacoes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participacoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "participacoes" ADD CONSTRAINT "participacoes_familia_id_fkey" FOREIGN KEY ("familia_id") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participacoes" ADD CONSTRAINT "participacoes_acao_id_fkey" FOREIGN KEY ("acao_id") REFERENCES "acoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
