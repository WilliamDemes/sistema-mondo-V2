/*
  Warnings:

  - You are about to drop the column `Observacoes` on the `participacoes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "participacoes" DROP COLUMN "Observacoes",
ADD COLUMN     "observacoes" TEXT;
