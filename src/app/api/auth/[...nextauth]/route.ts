import NextAuth from "next-auth";
import { getAuthOptions } from "@/src/lib/auth";

export async function GET(request: Request, ctx: any) {
  const { handlers } = NextAuth(await getAuthOptions());
  return handlers.GET(request, ctx as any);
}

export async function POST(request: Request, ctx: any) {
  const { handlers } = NextAuth(await getAuthOptions());
  return handlers.POST(request, ctx as any);
}
