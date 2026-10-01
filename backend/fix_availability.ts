import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixUsers() {
  const res = await prisma.user.updateMany({
    where: { isVerified: true },
    data: { isAvailable: true },
  });
  console.log(`Fixed ${res.count} users!`);
}

fixUsers().catch(console.error).finally(() => prisma.$disconnect());
