/*
  Warnings:

  - You are about to drop the `AcompanhamentoFamiliar` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "AcompanhamentoFamiliar";

-- CreateTable
CREATE TABLE "acompanhamento_familiar" (
    "id" SERIAL NOT NULL,
    "idFamilia" INTEGER NOT NULL,
    "dataVisita" TIMESTAMP(3) NOT NULL,
    "visitador" TEXT NOT NULL,
    "rua" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "telefone" TEXT,
    "statusEndereco" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "acompanhamento_familiar_pkey" PRIMARY KEY ("id")
);
