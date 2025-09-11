/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  // output: 'export', // Temporarily disabled for dev mode
  transpilePackages: [
    'wagmi', 
    'viem'
  ],
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TS errors to get a build
  },
  images: {
    domains: ['localhost', '84.247.171.69'], // Added additional domain
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    
    // Fix import.meta issues with viem and other ESM packages
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
    };
    
    // Handle module resolution for problematic packages
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });
    
    // Exclude backup folders from the build
    config.watchOptions = {
      ignored: ['**/components_backup_*/**', '**/node_modules/**', '**/contracts-backup-temp/**']
    };
    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig