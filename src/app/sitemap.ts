import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mudderfuger.ai'

/**
 * Mudderfuger is a one-page site — hero, MF's story, Pyro skateshop, BE A MF.
 * Those are anchors on `/`, not routes, so there is exactly one URL worth
 * declaring.
 *
 * /products/* is intentionally absent: those are Snipcart validation targets
 * carrying `noindex` (see products/layout.tsx). Listing a noindexed URL in a
 * sitemap sends Google contradictory instructions.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
