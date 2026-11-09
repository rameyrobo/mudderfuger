import type { Metadata } from 'next'

/**
 * /products/<id> opens that product's details over the BE A MF grid (the URL
 * the details modal pushes), so a link to one product can be shared. They are
 * not pages of their own: the storefront is the Pyro and BE A MF sections of
 * the homepage. Keep them reachable (a blocked URL can never be de-indexed),
 * but out of search results.
 *
 * Until 2026-11-08 Snipcart also fetched /products/all-products, pyro-board and
 * pyro-shirt to validate prices. Snipcart is gone, those three pages went with
 * it, and next.config redirects them to the home page sections.
 *
 * Applies to every child route: sponsor-me, add-yourself, submit-song,
 * product-commercial.
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
