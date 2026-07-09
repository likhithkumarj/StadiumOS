import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    // @ts-expect-error - devIndicator properties vary between Next versions
    appIsrStatus: false,
  },
};

export default nextConfig;
