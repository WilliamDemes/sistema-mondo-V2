/*
  Warnings:

  - You are about to drop the `families` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Grupo" AS ENUM ('APAE', 'PARTEIRA', 'SEMTRAS', 'SAO_TOME');

-- DropForeignKey
ALTER TABLE "beneficiaries" DROP CONSTRAINT "beneficiaries_family_id_fkey";

-- DropForeignKey
ALTER TABLE "participations" DROP CONSTRAINT "participations_family_id_fkey";

-- DropTable
DROP TABLE "families";

-- CreateTable
CREATE TABLE "familias" (
    "id" TEXT NOT NULL,
    "idmondo" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "grupo_de_referencia" "Grupo" NOT NULL,
    "status" "FamilyStatus" NOT NULL DEFAULT 'ATIVA',
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "familias_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "beneficiaries" ADD CONSTRAINT "beneficiaries_id_fkey" FOREIGN KEY ("id") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_id_fkey" FOREIGN KEY ("id") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
