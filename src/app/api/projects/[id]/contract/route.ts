import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/src/lib/auth";
import { getPrisma } from "@/src/lib/prisma";

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const prisma = await getPrisma();
  const contract = await prisma.contract.findUnique({ where: { projectId: params.id } });
  return NextResponse.json({ contract });
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { content, clientSignature, providerSignature } = await req.json();
  const prisma = await getPrisma();
  const exists = await prisma.contract.findUnique({ where: { projectId: params.id } });
  const data: any = { content };
  if (clientSignature) {
    data.clientSignature = clientSignature;
    data.clientSignedAt = new Date();
  }
  if (providerSignature) {
    data.providerSignature = providerSignature;
    data.providerSignedAt = new Date();
  }
  const contract = exists
    ? await prisma.contract.update({ where: { projectId: params.id }, data })
    : await prisma.contract.create({ data: { projectId: params.id, ...data } });
  return NextResponse.json({ contract });
}
