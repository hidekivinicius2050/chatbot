/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração simplificada para resolver problemas
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuração de API externa
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ]
  },
}

module.exports = nextConfig
