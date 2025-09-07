import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/src/lib/auth";
import { NextResponse } from "next/server";
import { getPrisma } from "@/src/lib/prisma";

export async function POST() {
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { authenticator } = await import("otplib");
  const secret = authenticator.generateSecret();
  const prisma = await getPrisma();
  const user = await prisma.user.update({ where: { email: session.user.email }, data: { twoFactorSecret: secret } });
  const otpauth = authenticator.keyuri(user.email!, "OrgProj", secret);
  return NextResponse.json({ otpauth, secret });
}
