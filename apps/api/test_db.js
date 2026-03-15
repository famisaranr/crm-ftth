const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const sub = await prisma.subscriber.findUnique({
      where: { account_number: 'ACC-2026-TEST' }
    });
    console.log('Subscriber:', sub);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
check();
