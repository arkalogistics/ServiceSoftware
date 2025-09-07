import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { registerSchema } from "@/src/lib/validators";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/src/lib/rateLimiter";

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown").toString();
  const rl = rateLimit(`register:${ip}`, 60_000, 10);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const json = await req.json();
  const parse = registerSchema.safeParse(json);
  if (!parse.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const { name, email, password } = parse.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email ya registrado" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });
  return NextResponse.json({ id: user.id, email: user.email });
}

