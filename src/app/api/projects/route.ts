import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { projectSchema } from "@/src/lib/validators";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projects = await prisma.project.findMany({
    where: { ownerId: (session.user as any).id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await req.json();
  const parse = projectSchema.safeParse(json);
  if (!parse.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const project = await prisma.project.create({
    data: { ...parse.data, ownerId: (session.user as any).id },
  });
  return NextResponse.json({ project });
}
