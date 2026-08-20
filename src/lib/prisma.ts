import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Prevents creating a new PrismaClient on every hot-reload in dev.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!;

  // Extract project ref from connection string for SNI (Supabase pooler)
  const url = new URL(connectionString);
  // The SNI hostname is the project ref for Supabase pooler
  const projectRef = process.env.SUPABASE_PROJECT_REF ?? "muisvsqoimlcjvqycomi";

  // Create pg Pool with SSL and SNI hostname for Supabase pooler
  const pool = new pg.Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
      servername: projectRef,
    },
  });

  const adapter = new PrismaPg(pool as never);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
