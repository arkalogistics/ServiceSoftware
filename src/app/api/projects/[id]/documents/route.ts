import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { documentSchema } from "@/src/lib/validators";

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const docs = await prisma.projectDocument.findMany({ where: { projectId: params.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ documents: docs });
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const json = await req.json();
  const parse = documentSchema.safeParse({ ...json, projectId: params.id });
  if (!parse.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const { assigneeIds = [], startDate, endDate, ...rest } = parse.data;
  const doc = await prisma.projectDocument.create({
    data: {
      ...rest,
      projectId: params.id,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      assignees: { create: assigneeIds.map((uid) => ({ userId: uid })) },
    },
  });
  return NextResponse.json({ document: doc });
}

