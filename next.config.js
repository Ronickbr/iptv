/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'i.imgur.com'],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  env: {
    CUSTOM_KEY: 'default_value',
  },
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Compress responses
  compress: true,
  
  // Enable experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['mysql2'],
  },
  
  async rewrites() {
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? process.env.API_URL || 'http://localhost:3001'
      : 'http://localhost:3001';
      
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
  
  // Security headers for production
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];
    
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
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig