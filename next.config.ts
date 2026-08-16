import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "pg"],
  devIndicators: false,
  cacheComponents: true,
};

export default nextConfig;
