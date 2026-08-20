import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [industries, sources, areas, services, users, roles] = await Promise.all([
    prisma.industry.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.leadSource.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.area.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.role.findMany({
      select: { id: true, name: true, label: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ industries, sources, areas, services, users, roles });
}
