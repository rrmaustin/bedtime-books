import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  webpack: (config) => {
    // Avoid bundling pdfkit on the server to prevent missing font metric files
    if (!config.externals) config.externals = [] as any;
    config.externals = Array.isArray(config.externals)
      ? [...config.externals, "pdfkit"]
      : config.externals;
    return config;
  },
};

export default nextConfig;
