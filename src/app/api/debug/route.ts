import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    return NextResponse.json({ status: "ok", db: "connected", result });
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json({ status: "error", error: err.message }, { status: 500 });
  }
}
