/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix HMR websocket for network access (192.168.x.x)
  allowedDevOrigins: ['192.168.1.36', 'localhost'],
  turbopack: {},
}

export default nextConfig
