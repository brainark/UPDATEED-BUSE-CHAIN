/** @type {import('next').NextConfig} */

// Build-optimized Next.js configuration to prevent timeouts
const nextConfig = {
  reactStrictMode: false, // Disable strict mode during build to prevent double initialization
  swcMinify: true,
  
  // Optimize build performance
  experimental: {
    // Disable features that can cause build timeouts
    esmExternals: false,
    serverComponentsExternalPackages: [],
  },

  // Webpack configuration for build optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize for build time
    if (!dev) {
      // Disable source maps for faster builds
      config.devtool = false
      
      // Optimize bundle splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            wallets: {
              test: /[\\/]node_modules[\\/](@walletconnect|@coinbase|@metamask|wagmi|viem)[\\/]/,
              name: 'wallets',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      }
    }

    // Handle wallet-related modules that might cause build issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }

    // Ignore problematic modules during build
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(lokijs|pino-pretty|encoding)$/,
      })
    )

    // Add timeout for module resolution
    config.resolve.plugins = config.resolve.plugins || []
    
    return config
  },

  // Environment variables for build optimization
  env: {
    NEXT_BUILD_TIMEOUT: '300000', // 5 minutes
    DISABLE_WALLET_CONNECT_DURING_BUILD: 'true',
  },

  // Disable features that can cause network requests during build
  images: {
    unoptimized: true, // Disable image optimization during build
  },

  // Output configuration
  output: 'standalone',
  
  // Disable telemetry to speed up build
  telemetry: false,

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Headers to prevent caching issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },

  // Redirects for build optimization
  async redirects() {
    return []
  },

  // Rewrites for API optimization
  async rewrites() {
    return []
  },
}

module.exports = nextConfig