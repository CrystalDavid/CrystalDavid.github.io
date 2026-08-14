import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  transpilePackages: ["@david/site-contract"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
