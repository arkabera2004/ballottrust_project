import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const party = await prisma.party.update({
    where: {
      id: '69c75e1c-530e-4016-b4ee-a1b5f7d7b8f5',
    },
    data: {
      status: 'ACTIVE',
      deletedAt: new Date(),
    },
  });

  console.log({
    id: party.id,
    name: party.name,
    status: party.status,
    deletedAt: party.deletedAt,
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });