import { PrismaClient } from "@prisma/client";

const useLibsql = !!process.env.LIBSQL_URL;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export async function getPrisma(): Promise<PrismaClient> {
  if (global.prisma) return global.prisma;

  if (useLibsql) {
    const { PrismaLibSQL } = await import("@prisma/adapter-libsql");
    const adapter = new PrismaLibSQL({
      url: process.env.LIBSQL_URL!,
      authToken: process.env.LIBSQL_AUTH_TOKEN,
    } as any);
    global.prisma = new PrismaClient({ adapter } as any);
  } else {
    global.prisma = new PrismaClient();
  }
  return global.prisma;
}
