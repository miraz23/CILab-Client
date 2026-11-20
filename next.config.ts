import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
        ],
    },
    async redirects() {
        return [
            // Share links were briefly issued under /contributors; keep them working.
            { source: "/contributors/:token", destination: "/profile/:token", permanent: true },
        ];
    },
};

export default nextConfig;
