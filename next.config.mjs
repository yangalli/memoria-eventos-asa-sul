/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Não interrompe o build se houver avisos
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Não interrompe o build se houver erros
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
