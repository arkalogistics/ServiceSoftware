import { PrismaClient } from "@prisma/client";

// Optional: Turso/libSQL in production via Prisma driver adapter
let prisma: PrismaClient;

const useLibsql = !!process.env.LIBSQL_URL;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

if (!global.prisma) {
  if (useLibsql) {
    // Lazy import to keep dev without these deps
    const { createClient } = await import("@libsql/client");
    const { PrismaLibSQL } = await import("@prisma/adapter-libsql");

    const libsql = createClient({
      url: process.env.LIBSQL_URL!,
      authToken: process.env.LIBSQL_AUTH_TOKEN,
    });
    const adapter = new PrismaLibSQL(libsql);
    prisma = new PrismaClient({ adapter });
  } else {
    prisma = new PrismaClient();
  }
  global.prisma = prisma;
} else {
  prisma = global.prisma;
}

export { prisma };
