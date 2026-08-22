import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

const result = await prisma.$queryRaw`SELECT 1 as test`;
console.log('Connected:', result);
await prisma.$disconnect();
console.log('Disconnected');
process.exit(0);
