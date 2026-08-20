import { PrismaClient } from '@prisma/client';

const regions = [
  'ap-south-1', 'ap-southeast-1', 'ap-northeast-1', 
  'us-east-1', 'us-east-2', 'us-west-1',
  'eu-west-1', 'eu-central-1', 'eu-west-2',
  'eu-north-1', 'ap-northeast-2', 'ap-northeast-3'
];

for (const region of regions) {
  const url = `postgresql://postgres.bydetiykbwupoznvubzl:f54%26kM%24tXG4k%40c%26@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  process.env.DATABASE_URL = url;
  console.log(`Trying ${region}...`);
  const prisma = new PrismaClient();
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`✅ SUCCESS with ${region}! Result:`, result);
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.log(`❌ ${region}: ${e.message.substring(0, 150)}`);
  }
  await prisma.$disconnect();
}
console.log('No region worked');
process.exit(1);
