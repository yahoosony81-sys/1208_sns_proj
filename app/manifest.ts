import { MetadataRoute } from 'next';

/**
 * @file manifest.ts
 * @description Web App Manifest 파일 생성
 *
 * PWA(Progressive Web App) 지원을 위한 manifest.json 파일을 동적으로 생성합니다.
 */

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

  return {
    name: 'Mini Instagram',
    short_name: 'Mini IG',
    description: 'Instagram 스타일 SNS 애플리케이션',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#0095f6',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-256x256.png',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

