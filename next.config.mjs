/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [
      '@huggingface/transformers',
      'onnxruntime-node',
      'pg',
      'bcryptjs',
    ],
  },
};

export default nextConfig;
