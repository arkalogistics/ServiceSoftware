import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/src/lib/auth";
import { NextResponse } from "next/server";
import { getPrisma } from "@/src/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { code } = await req.json();
  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.twoFactorSecret) return NextResponse.json({ error: "No secret" }, { status: 400 });
  const { authenticator } = await import("otplib");
  const valid = authenticator.check((code || "").toString(), user.twoFactorSecret);
  if (!valid) return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
  return NextResponse.json({ ok: true });
}
