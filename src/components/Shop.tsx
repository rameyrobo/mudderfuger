'use client';

/**
 * The shop without Snipcart (2026-11-08, card #154): products come in from the content API (src/lib/shop.ts,
 * read in the root layout) and the cart lives in this browser. It holds items, quantities and sizes and
 * survives a reload; checkout stays closed until the Stripe key is in, so nothing here takes money yet.
 *
 * A photo or song picked for "Add Yourself" or "Submit a Song" stays in memory with its cart line and is
 * not uploaded anywhere until checkout exists (Snipcart uploaded only after payment, and so will we).
 * After a reload the line keeps the file's name and asks for the file again at checkout.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/shop';

export type CartOption = { name: string; value: string };
export type CartLine = {
  key: string;
  id: string;
  title: string;
  unitPrice: number;
  qty: number;
  maxQty: number;
  options: CartOption[];
  files: string[];
  image?: string;
};
type AddInput = Omit<CartLine, 'key' | 'qty' | 'files'> & { files?: { label: string; file: File }[] };

type Shop = {
  products: Product[];
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (item: AddInput) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  fileFor: (key: string) => File[] | undefined;
};

const ShopContext = createContext<Shop | null>(null);
const STORE = 'mf-cart-v1';
const money = (n: number) => `$${n.toFixed(2)}`;

export function useShop(): Shop {
  const s = useContext(ShopContext);
  if (!s) throw new Error('useShop outside ShopProvider');
  return s;
}

export function ShopProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const files = useRef(new Map<string, File[]>());

  // read after mount, so the server render and the first client render agree
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || '[]');
      if (Array.isArray(saved)) setLines(saved.filter((l) => l && l.key && l.id && Number.isFinite(l.unitPrice)));
    } catch { /* a broken or blocked store starts empty */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORE, JSON.stringify(lines)); } catch { /* private mode: the cart lasts the visit */ }
  }, [lines, ready]);

  const add = useCallback((item: AddInput) => {
    const base = `${item.id}|${item.options.map((o) => `${o.name}=${o.value}`).join(';')}`;
    setLines((prev) => {
      // a line with an attached file is always its own line; anything else stacks up to its limit
      if (!item.files?.length) {
        const hit = prev.find((l) => l.key === base);
        if (hit) return prev.map((l) => (l.key === base ? { ...l, qty: Math.min(l.maxQty, l.qty + 1) } : l));
      }
      const key = item.files?.length ? `${base}|${Date.now()}` : base;
      if (item.files?.length) files.current.set(key, item.files.map((f) => f.file));
      const { files: picked, ...rest } = item;
      return [...prev, { ...rest, key, qty: 1, files: (picked ?? []).map((f) => `${f.label}: ${f.file.name}`) }];
    });
    setOpen(true);
  }, []);
  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(l.maxQty, qty)) } : l)));
  }, []);
  const remove = useCallback((key: string) => {
    files.current.delete(key);
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const value = useMemo<Shop>(() => ({
    products, lines, open, setOpen, add, setQty, remove,
    count: lines.reduce((n, l) => n + l.qty, 0),
    subtotal: lines.reduce((n, l) => n + l.qty * l.unitPrice, 0),
    fileFor: (key) => files.current.get(key),
  }), [products, lines, open, add, setQty, remove]);

  return (
    <ShopContext.Provider value={value}>
      {children}
      <CartButton />
      <CartDrawer />
    </ShopContext.Provider>
  );
}

function CartButton() {
  const { count, setOpen, open } = useShop();
  if (!count || open) return null;
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="fixed bottom-4 right-4 z-[998] font-arial-bold uppercase bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded shadow-lg cursor-pointer"
      aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
    >
      Cart ({count})
    </button>
  );
}

function CartDrawer() {
  const { lines, subtotal, open, setOpen, setQty, remove, fileFor } = useShop();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true" aria-labelledby="cart-title">
      <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
      <aside className="absolute top-0 right-0 h-full w-full max-w-md bg-white text-black flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="cart-title" className="font-arial-bold uppercase text-xl">Cart</h2>
          <button ref={closeRef} type="button" onClick={() => setOpen(false)}
            className="font-arial-bold uppercase text-sm border-2 border-black rounded px-3 py-1 hover:invert cursor-pointer">
            Close
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto px-6 divide-y divide-gray-200">
          {!lines.length && <li className="py-8 font-arial text-gray-600">Your cart is empty.</li>}
          {lines.map((l) => {
            const missing = l.files.length > 0 && !fileFor(l.key);
            return (
              <li key={l.key} className="py-4 flex gap-4">
                {l.image && (
                  <Image src={l.image} alt="" width={64} height={64} className="w-16 h-16 object-cover rounded bg-gray-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-arial-bold uppercase leading-tight">{l.title}</p>
                  {l.options.map((o) => <p key={o.name} className="font-arial text-sm text-gray-700">{o.name}: {o.value}</p>)}
                  {l.files.map((f) => <p key={f} className="font-arial text-sm text-gray-700 break-all">{f}</p>)}
                  {missing && <p className="font-arial text-xs text-gray-500">The file stays on this device. You&apos;ll attach it again at checkout.</p>}
                  <div className="mt-2 flex items-center gap-3">
                    {l.maxQty > 1 ? (
                      <div className="flex items-center border border-gray-300 rounded">
                        <button type="button" aria-label={`One less ${l.title}`} disabled={l.qty <= 1}
                          onClick={() => setQty(l.key, l.qty - 1)} className="px-2 py-0.5 disabled:opacity-40 cursor-pointer">−</button>
                        <span className="px-2 font-arial text-sm" aria-live="polite">{l.qty}</span>
                        <button type="button" aria-label={`One more ${l.title}`} disabled={l.qty >= l.maxQty}
                          onClick={() => setQty(l.key, l.qty + 1)} className="px-2 py-0.5 disabled:opacity-40 cursor-pointer">+</button>
                      </div>
                    ) : null}
                    <button type="button" onClick={() => remove(l.key)}
                      className="font-arial text-sm underline text-gray-600 hover:text-red-600 cursor-pointer">Remove</button>
                  </div>
                </div>
                <p className="font-arial-bold whitespace-nowrap">{money(l.unitPrice * l.qty)}</p>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-gray-200 px-6 py-5">
          <div className="flex justify-between font-arial-bold uppercase mb-4">
            <span>Subtotal</span><span>{money(subtotal)}</span>
          </div>
          <button type="button" disabled
            className="w-full font-arial-bold uppercase bg-black text-white px-6 py-3 rounded opacity-50 cursor-not-allowed">
            Checkout opens soon
          </button>
          <p className="font-arial text-xs text-gray-600 mt-3">
            We&apos;re setting up payments. Your cart stays saved on this device until checkout opens.
          </p>
        </div>
      </aside>
    </div>
  );
}
