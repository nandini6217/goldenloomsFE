/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.shopify.com', pathname: '/**' },
      // Add any other image hostnames used by the API (e.g. Cloudinary, S3) for optimized next/image loading
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'amzn-goldenlooms-bucket.s3.ap-south-1.amazonaws.com', pathname: '/**' },
    ],
  },
};

module.exports = nextConfig;
