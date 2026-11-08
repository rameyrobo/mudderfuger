/**
 * The shop's products come from the content API (the mudderfuger-content instance on vps458, Postgres
 * behind it), not from the repo. Moved there 2026-11-08 when Snipcart was dropped. Read on the server in
 * the root layout and cached for five minutes; if the API is down the last good copy keeps serving, and
 * with nothing cached the shop sections render empty instead of breaking the page.
 */

export type CustomField = { name: string; type: 'checkbox' | 'dropdown' | string; options?: string; required?: boolean };
export type UploadField = {
  name: string;
  description: string;
  type: string;
  accept: string;
  required: boolean;
  important?: string[];
  checkbox1?: { label: string; required: boolean };
  checkbox2?: { label: string; required: boolean };
};
export type MediaItem = { type: string; src: string; alt: string; name?: string };

export type Product = {
  id: string;
  title: string;
  price?: number;
  itemPrice?: number;
  description: string;
  url?: string;
  category?: string;
  includes: string[];
  media?: MediaItem[];
  upload?: UploadField[];
  customFields?: CustomField[];
  availablePlans?: { id: string; name: string; frequency: string; interval: number; itemPrice: number }[];
  images?: string[];
  image?: string;
};

export async function getProducts(): Promise<Product[]> {
  // read inside the function, never at module scope (a top-level throw takes the whole bundle down)
  const api = (process.env.CONTENT_API_URL ?? '').replace(/\/$/, '');
  if (!api) return [];
  try {
    const res = await fetch(`${api}/api/collections/products`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const d = (await res.json()) as { items?: Record<string, unknown>[] };
    // The API adds its own bookkeeping (a numeric row id, sort, published, updatedAt). The item's slug is the
    // product's id ("pyro-board"), which is what the site and the /products/<id> links use.
    return (d.items ?? []).map((item) => {
      const { slug, id: _row, sort: _o, published: _p, updatedAt: _u, ...p } = item;
      return { includes: [], ...p, id: String(slug) } as unknown as Product;
    });
  } catch {
    return [];
  }
}
