/** @type {import('next').NextConfig} */
const nextConfig = {
         // Use only App Router, disable Pages Router
         pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
         distDir: '.next',
         experimental: {
                  typedRoutes: true,
         },
         images: {
                  remotePatterns: [
                           {
                                    protocol: 'https',
                                    hostname: '**',
                           },
                  ],
         },
         transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', 'gsap'],
         eslint: {
                  ignoreDuringBuilds: true,
         },
         typescript: {
                  ignoreBuildErrors: true,
         },

         webpack: (config, { isServer }) => {
                  if (!isServer) {
                           config.resolve.fallback = {
                                    ...config.resolve.fallback,
                                    fs: false,
                                    net: false,
                                    tls: false,
                           };
                  }
                  return config;
         },

         env: {
                  CUSTOM_KEY: process.env.NEXT_PUBLIC_CUSTOM_KEY || '',
         },
};

export default nextConfig;

