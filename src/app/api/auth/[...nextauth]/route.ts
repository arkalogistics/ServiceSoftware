import NextAuth from "next-auth";
import { getAuthOptions } from "@/src/lib/auth";

const handler = NextAuth(await getAuthOptions());
export { handler as GET, handler as POST };
