import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next stops auto-detecting the user's home
  // package-lock.json. See the warning at build time without this.
  turbopack: {
    root: path.resolve(import.meta.dirname, ".."),
  },
};

export default nextConfig;
