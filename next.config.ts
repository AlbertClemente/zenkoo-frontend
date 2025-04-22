import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  /* config options here */
    // ⚠️ Desactivado temporalmente para evitar doble conexión WebSocket en desarrollo
  reactStrictMode: false, 
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
