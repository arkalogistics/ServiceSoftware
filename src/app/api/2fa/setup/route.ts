import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { authenticator } = await import("otplib");
  const secret = authenticator.generateSecret();
  const user = await prisma.user.update({ where: { email: session.user.email }, data: { twoFactorSecret: secret } });
  const otpauth = authenticator.keyuri(user.email!, "OrgProj", secret);
  return NextResponse.json({ otpauth, secret });
}

