import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const leagues = await prisma.league.findMany();
  console.log('Leagues:', leagues);
}
main().catch(console.error).finally(() => prisma.$disconnect());
