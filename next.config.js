const nextConfig = {
  reactStrictMode: true,
  
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };
    
    // Exclude problematic packages
    config.externals.push('pino-pretty', 'encoding');
    
    return config;
  },
  
  // Image configuration
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
}

module.exports = nextConfig