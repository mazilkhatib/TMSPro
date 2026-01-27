import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Using official @apollo/client-integration-nextjs package
  // No special webpack configuration needed
  output: "standalone",
};

export default nextConfig;
