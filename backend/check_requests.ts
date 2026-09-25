import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.bloodRequest.findMany({
    select: {
      id: true,
      bloodGroup: true,
      hospitalName: true,
      hospitalLat: true,
      hospitalLng: true,
      requesterId: true,
      status: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(requests, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
