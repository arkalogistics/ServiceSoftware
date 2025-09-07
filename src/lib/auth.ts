import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getPrisma } from "./prisma";
import bcrypt from "bcryptjs";

export async function getAuthOptions(): Promise<NextAuthOptions> {
  // No DB adapter: we use JWT sessions only and query Prisma in authorize() as needed.
  return {
    session: { strategy: "jwt" },
    pages: {},
    providers: [
      Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
          const prisma = await getPrisma();
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user || !user.passwordHash) return null;
          const ok = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!ok) return null;

          return {
            id: user.id,
            name: user.name ?? undefined,
            email: user.email ?? undefined,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (token && session.user) {
          (session.user as any).id = token.id;
        }
        return session;
      },
    },
    cookies: {
      sessionToken: {
        name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  } satisfies NextAuthOptions;
}
