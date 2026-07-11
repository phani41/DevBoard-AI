import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    domains: ["localhost", "via.placeholder.com"],
  },
};

export default nextConfig;
