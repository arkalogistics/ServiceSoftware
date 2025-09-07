import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

interface Params { params: { docId: string } }

export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { title, status, startDate, endDate, totalHours, comments } = body || {};
  const data: any = {};
  if (typeof title === "string") data.title = title;
  if (typeof status === "string") data.status = status;
  if (typeof comments === "string") data.comments = comments;
  if (typeof totalHours !== "undefined") data.totalHours = parseInt(totalHours as any, 10) || 0;
  if (typeof startDate === "string") data.startDate = startDate ? new Date(startDate) : null;
  if (typeof endDate === "string") data.endDate = endDate ? new Date(endDate) : null;

  const doc = await prisma.projectDocument.update({ where: { id: params.docId }, data });
  return NextResponse.json({ document: doc });
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.projectDocument.delete({ where: { id: params.docId } });
  return NextResponse.json({ ok: true });
}

