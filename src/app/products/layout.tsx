import type { Metadata } from 'next'

/**
 * Everything under /products/* exists for ONE reason: Snipcart fetches these
 * URLs server-side to validate price and custom fields before accepting an
 * order. They are infrastructure, not pages a customer is meant to land on —
 * the real storefront is the Pyro and BE A MF sections of the homepage.
 *
 * So: keep them reachable (Snipcart needs them, and a blocked URL can never
 * be de-indexed), but keep them out of search results.
 *
 * Without this, they are indexable by default. Vercel adds a noindex header
 * to *preview* deployments, which masks the problem — on the production
 * domain that protection is gone and these thin pages compete with the site.
 *
 * Applies to every child route: all-products, pyro-board, pyro-shirt,
 * sponsor-me, add-yourself, submit-song, product-commercial.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true, // still let crawlers walk links back out to the real site
    nocache: true,
    googleBot: { index: false, follow: true },
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
