import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    return NextResponse.json({
      status: "ok",
      db: "connected",
      directUrl: process.env.DIRECT_URL ? "set (length " + process.env.DIRECT_URL.length + ")" : "NOT SET",
      databaseUrl: process.env.DATABASE_URL ? "set (length " + process.env.DATABASE_URL.length + ")" : "NOT SET",
      authSecret: process.env.AUTH_SECRET ? "set (length " + process.env.AUTH_SECRET.length + ")" : "NOT SET",
      result,
    });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json({
      status: "error",
      directUrl: process.env.DIRECT_URL ? "set (length " + process.env.DIRECT_URL.length + ")" : "NOT SET",
      databaseUrl: process.env.DATABASE_URL ? "set (length " + process.env.DATABASE_URL.length + ")" : "NOT SET",
      error: err.message,
      stack: err.stack?.split("\n").slice(0, 5),
    }, { status: 500 });
  }
}
