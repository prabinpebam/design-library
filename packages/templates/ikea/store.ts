/**
 * The IKEA store's one store (Q137): the bag, the product and category being looked at, and the last order. Every
 * screen reads it, so the bag holds its lines from the product page to the checkout; it lasts for the browser tab.
 */
import { useSyncExternalStore } from 'react';

export interface BagLine {
  product: string;
  finish: string;
  quantity: number;
}

export interface Order {
  number: string;
  name: string;
  email: string;
  address: string;
  delivery: string;
  payment: string;
  lines: BagLine[];
  total: number;
}

export interface StoreState {
  bag: BagLine[];
  product?: string;
  room?: string;
  category: string;
  query: string;
  order?: Order;
}

const KEY = 'design-library.template.ikea';
const read = (): StoreState => {
  try {
    const saved = typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(KEY);
    if (saved) return { category: 'all', query: '', ...JSON.parse(saved) };
  } catch {
    /* a private window without storage: start empty */
  }
  return { bag: [], category: 'all', query: '' };
};

let state = read();
const listeners = new Set<() => void>();
const set = (next: Partial<StoreState>) => {
  state = { ...state, ...next };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* not kept: the bag still works for this page */
  }
  for (const l of listeners) l();
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useStore = () => useSyncExternalStore(subscribe, () => state, () => state);

export const store = {
  look: (product: string) => set({ product }),
  visit: (room: string) => set({ room }),
  browse: (category: string) => set({ category, query: '' }),
  search: (query: string) => set({ query, category: 'all' }),
  add: (product: string, finish: string, quantity = 1) => {
    const at = state.bag.findIndex((l) => l.product === product && l.finish === finish);
    set({ bag: at < 0 ? [...state.bag, { product, finish, quantity }] : state.bag.map((l, i) => (i === at ? { ...l, quantity: l.quantity + quantity } : l)) });
  },
  quantity: (index: number, quantity: number) => set({ bag: state.bag.map((l, i) => (i === index ? { ...l, quantity } : l)) }),
  remove: (index: number) => {
    const line = state.bag[index];
    set({ bag: state.bag.filter((_, i) => i !== index) });
    return () => set({ bag: [...state.bag.slice(0, index), line, ...state.bag.slice(index)] });
  },
  place: (order: Order) => set({ order, bag: [] }),
};
