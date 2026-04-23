import type { NextConfig } from "next";

const isMobile = process.env.BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  ...(isMobile && {
    output: "export",
    images: { unoptimized: true },
    trailingSlash: true,
  }),
};

export default nextConfig;
