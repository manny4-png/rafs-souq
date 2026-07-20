import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "http", hostname: "127.0.0.1", port: "8001" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      { protocol: "http", hostname: "localhost", port: "8001" },
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "192.168.100.11", port: "8000" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog"],
  },
};

export default nextConfig;
