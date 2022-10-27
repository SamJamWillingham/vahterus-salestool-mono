/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const firstOfferId = '5c03994c-fc16-47e0-bd02-d218a370a078';
  await prisma.offer.upsert({
    where: {
      id: firstOfferId,
    },
    create: {
      id: firstOfferId,
      offerId: 'a21-001-001',
      responsiblePerson: 'Samantha Willingham',
    },
    update: {},
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
