const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function test() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to Prisma DB!');
  } catch (err) {
    console.error('CRITICAL CONNECTION ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
