import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

interface Params { params: { docId: string } }

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { path, minutes = 20 } = await req.json();
  if (!path) return NextResponse.json({ error: "No path" }, { status: 400 });

  await prisma.screenshot.create({ data: { documentId: params.docId, imagePath: path } });
  const count = await prisma.screenshot.count({ where: { documentId: params.docId } });
  const totalMinutes = count * Number(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const doc = await prisma.projectDocument.update({ where: { id: params.docId }, data: { totalHours: hours } });
  return NextResponse.json({ ok: true, count, hours, minutes: totalMinutes, document: doc });
}

export async function GET(_: Request, { params }: Params) {
  const screenshots = await prisma.screenshot.findMany({ where: { documentId: params.docId }, orderBy: { capturedAt: "desc" } });
  return NextResponse.json({ screenshots });
}
