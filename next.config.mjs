/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Define a specific pattern to match IPFS URLs, allowing CORS for them
        source: '/api/ipfs/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,HEAD,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
      {
        // Allowing external IPFS URLs
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};

export default nextConfig;
