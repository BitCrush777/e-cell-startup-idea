import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/how-it-works',
          '/security',
          '/pricing',
          '/business',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/room/',
          '/join/',
          '/api/',
          '/dashboard/',
          '/admin/',
          '/settings/',
          '/scan/',
        ],
      },
    ],
    sitemap: 'https://templink.in/sitemap.xml',
  };
}
