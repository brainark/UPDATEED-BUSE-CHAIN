/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  transpilePackages: [],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable static optimization to fix getStaticPaths error
  experimental: {
    esmExternals: false,
    disableOptimizedLoading: true,
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    
    // Disable webpack optimizations that cause issues
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    
    // Fix import.meta issue
    config.module.rules.push({
      test: /\.(js|ts|tsx)$/,
      include: [/node_modules\/(viem|@wagmi)/],
      use: {
        loader: 'next-swc-loader',
        options: {
          parseMap: true,
          jsc: {
            parser: {
              syntax: 'ecmascript',
              jsx: true,
            },
          },
        },
      },
    });
    
    return config;
  },
}

module.exports = nextConfig