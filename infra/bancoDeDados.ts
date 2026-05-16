import { PrismaClient } from "@prisma/client";
import { Pool }from "pg"
import { PrismaPg } from "@prisma/adapter-pg"; // 1. Importamos o adaptador

// 2. Criamos o adaptador apontando para o nosso cofre (.env)
const adaptador = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalParaPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalParaPrisma.prisma ??
  new PrismaClient({
    adapter: adaptador, // 3. Entregamos a ferramenta de ligação ao Prisma!
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : [],
  });

if (process.env.NODE_ENV !== "production") globalParaPrisma.prisma = prisma;