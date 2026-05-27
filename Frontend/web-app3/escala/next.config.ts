import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizePackageImports: ["next-intl", "lucide-react", "date-fns", "framer-motion"],
  },
  typedRoutes: true,
  reactStrictMode: true,
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
