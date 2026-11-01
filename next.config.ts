import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the Postgres driver as a normal Node dependency on the server.
  serverExternalPackages: ["pg"],
  // Ship optional hero photos with the server bundle so the home page can see them on Vercel.
  outputFileTracingIncludes: { "/": ["./public/hero/**/*"] },
};

export default nextConfig;
