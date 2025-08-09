// scripts/clearTable.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.userVocabulary.deleteMany();
}

main().finally(() => prisma.$disconnect());
