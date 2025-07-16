import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/upload",
        destination: "http://backend:5000/upload",
      },
      {
        source: "/api/conversation",
        destination: "http://backend:5000/conversation",
      },
    ];
  },
};
export default nextConfig;
