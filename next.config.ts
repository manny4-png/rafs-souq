import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiOrigin = apiUrl ? new URL(apiUrl).origin : "http://127.0.0.1:8000";
const developmentScriptPolicy = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";
const apiHost = new URL(apiOrigin);
const allowedDevOrigins = (process.env.NEXT_ALLOWED_DEV_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "127.0.0.1", port: "8001" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      { protocol: "http", hostname: "localhost", port: "8001" },
      { protocol: "http", hostname: "localhost", port: "8000" },
      {
        protocol: apiHost.protocol.replace(":", "") as "http" | "https",
        hostname: apiHost.hostname,
        port: apiHost.port,
      },
    ],
  },
  allowedDevOrigins,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; form-action 'self'; img-src 'self' data: blob: http: https:; media-src 'self'; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'${developmentScriptPolicy}; connect-src 'self' ${apiOrigin} https://api.web3forms.com`,
          },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dialog"],
  },
};

export default nextConfig;
