import { MetadataRoute } from 'next';

/**
 * @file robots.ts
 * @description robots.txt 파일 생성
 *
 * 검색 엔진 크롤러를 위한 robots.txt 파일을 동적으로 생성합니다.
 */

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth-test/', '/storage-test/', '/instruments/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

