import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
console.log("Connecting to:", url ? url.substring(0, 60) + "..." : "UNDEFINED");

try {
  const adapter = new PrismaPg({ connectionString: url });
  const prisma = new PrismaClient({ adapter });
  await prisma.$connect();
  console.log("CONNECTED OK");
  const count = await prisma.lead.count();
  console.log("Lead count:", count);
  await prisma.$disconnect();
} catch (e) {
  console.error("ERROR:", e.message);
  process.exit(1);
}
