import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  distDir: process.env.PLAYWRIGHT_TEST_SESSION === "1" && process.env.PACKETSECRETS_TEST_ENV === "test"
    ? ".next-playwright"
    : ".next",
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({ extension: /\.mdx$/ });

export default withMDX(nextConfig);
