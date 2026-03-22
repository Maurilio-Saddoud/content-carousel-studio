import type { NextConfig } from 'next'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'content-carousel-studio'
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.BASE_PATH ?? ''
const basePath = configuredBasePath || (process.env.GITHUB_ACTIONS ? `/${repoName}` : '')

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

export default nextConfig
