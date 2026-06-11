/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'i.imgur.com'],
    unoptimized: process.env.NODE_ENV === 'production',
  },
  compress: true,
  experimental: {
    serverComponentsExternalPackages: ['mysql2'],
  },
  
  async rewrites() {
    const defaultApiUrl = process.env.NODE_ENV === 'production'
      ? `http://127.0.0.1:${process.env.API_PORT || '3001'}`
      : 'http://localhost:3001'
    const apiUrl = process.env.API_URL || defaultApiUrl
      
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
  
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
