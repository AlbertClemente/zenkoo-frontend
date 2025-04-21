import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    // ⚠️ Desactivado temporalmente para evitar doble conexión WebSocket en desarrollo
  reactStrictMode: false, 
};

export default nextConfig;
