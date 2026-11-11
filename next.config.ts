import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the Postgres driver as a normal Node dependency on the server.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
