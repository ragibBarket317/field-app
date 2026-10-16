/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    outputFileTracingIncludes: { '/api/tada/export': ['./templates/**/*'] },
  },
};
