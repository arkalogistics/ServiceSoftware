/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
    // Avoid bundling native/dynamic @libsql bits into RSC/SSR build
    serverComponentsExternalPackages: [
      "@libsql/client",
      "@prisma/adapter-libsql",
      "libsql",
      "@libsql/isomorphic-ws",
      "@libsql/isomorphic-fetch",
      "@libsql/hrana-client",
      "@neon-rs/load",
      "detect-libc",
      "ws",
      "node-fetch",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Do not let Webpack try to crawl all files under @libsql/*
      // which includes README.md, LICENSE, etc. Treat them as externals.
      config.externals = config.externals || [];
      config.externals.push(/^@libsql\/.*$/);
    }
    return config;
  },
};

export default nextConfig;
