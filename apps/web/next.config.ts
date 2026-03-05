import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@myotherpair/types'],
};

export default nextConfig;
