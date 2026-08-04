/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite fetch cross-origin ao ESP32 via API route
  async rewrites() {
    return []
  },
}

module.exports = nextConfig
