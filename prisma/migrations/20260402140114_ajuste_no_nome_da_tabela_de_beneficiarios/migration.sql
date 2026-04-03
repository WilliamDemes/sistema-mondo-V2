/*
  Warnings:

  - You are about to drop the `beneficiario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "beneficiario" DROP CONSTRAINT "beneficiario_id_fkey";

-- DropTable
DROP TABLE "beneficiario";

-- CreateTable
CREATE TABLE "beneficiarios" (
    "id" TEXT NOT NULL,
    "family_id" TEXT NOT NULL,
    "id_mondo_morador" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "data_nascimento" TIMESTAMP(3) NOT NULL,
    "idade" INTEGER NOT NULL,
    "cor" "Cor" NOT NULL,
    "responsavel" "Responsavel" NOT NULL,
    "parentesco" "Parentesco" NOT NULL,
    "sexo" "Sexo" NOT NULL,
    "cpf" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beneficiarios_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "beneficiarios" ADD CONSTRAINT "beneficiarios_id_fkey" FOREIGN KEY ("id") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
