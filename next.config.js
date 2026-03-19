/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://grantos.ai',
    NEXT_PUBLIC_APP_NAME: 'Grant OS',
  },
  images: {
    domains: ['grantos.ai'],
  },
}

module.exports = nextConfig
