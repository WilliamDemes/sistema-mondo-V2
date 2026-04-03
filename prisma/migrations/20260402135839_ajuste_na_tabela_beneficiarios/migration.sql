/*
  Warnings:

  - You are about to drop the column `idmondo` on the `familias` table. All the data in the column will be lost.
  - The `status` column on the `familias` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `beneficiaries` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_mondo_familia` to the `familias` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StatusFamilia" AS ENUM ('ATIVA', 'INATIVA');

-- CreateEnum
CREATE TYPE "Cor" AS ENUM ('BRANCO', 'PRETO', 'PARDO');

-- CreateEnum
CREATE TYPE "Responsavel" AS ENUM ('Sim', 'Não');

-- CreateEnum
CREATE TYPE "Parentesco" AS ENUM ('PAI', 'MAE', 'FILHO', 'FILHA', 'AVO', 'OUTRO');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('Masculino', 'Feminino');

-- DropForeignKey
ALTER TABLE "beneficiaries" DROP CONSTRAINT "beneficiaries_id_fkey";

-- AlterTable
ALTER TABLE "familias" DROP COLUMN "idmondo",
ADD COLUMN     "id_mondo_familia" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "StatusFamilia" NOT NULL DEFAULT 'ATIVA';

-- DropTable
DROP TABLE "beneficiaries";

-- DropEnum
DROP TYPE "BeneficiaryRole";

-- DropEnum
DROP TYPE "FamilyStatus";

-- CreateTable
CREATE TABLE "beneficiario" (
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

    CONSTRAINT "beneficiario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "beneficiario" ADD CONSTRAINT "beneficiario_id_fkey" FOREIGN KEY ("id") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
