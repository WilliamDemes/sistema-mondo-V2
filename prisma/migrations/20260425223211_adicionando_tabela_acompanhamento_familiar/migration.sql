-- CreateTable
CREATE TABLE "AcompanhamentoFamiliar" (
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

    CONSTRAINT "AcompanhamentoFamiliar_pkey" PRIMARY KEY ("id")
);
