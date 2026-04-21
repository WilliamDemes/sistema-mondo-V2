-- CreateTable
CREATE TABLE "indicadores" (
    "id_indicador" TEXT NOT NULL,
    "dimensao" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "indicador_oficial" TEXT NOT NULL,
    "peso" INTEGER NOT NULL,
    "indicador_resumido" TEXT NOT NULL,

    CONSTRAINT "indicadores_pkey" PRIMARY KEY ("id_indicador")
);
