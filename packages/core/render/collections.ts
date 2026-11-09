/**
 * Collections and references (DP12, DR21, DR22): finds a collection's item by its id, resolves `{ "ref": … }` and
 * `{ "item": … }` values anywhere in site and page content, and gives an item the address of its own page. Pure: no
 * React, no state, so the content check and a build step can call the same functions.
 */
import type { CollectionDocument, PageDocument, Site } from './types';

type Item = Record<string, unknown>;

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const only = (v: Record<string, unknown>, ...keys: string[]) => Object.keys(v).every((k) => keys.includes(k));

/** A `{ ref }` value: `{ "ref": "books/the-long-shore" }`, optionally with `field`. */
export const isRef = (v: unknown): v is { ref: string; field?: string } => isObject(v) && typeof v.ref === 'string' && only(v, 'ref', 'field');
/** An `{ item }` value: `{ "item": "title" }`. */
export const isItemValue = (v: unknown): v is { item: string } => isObject(v) && typeof v.item === 'string' && only(v, 'item');

/** A list binding (DP13): a collection's items, filtered, sorted and limited, in place of a hand-written list. */
export interface Binding {
  /** The collection's id. */
  from: string;
  /**
   * Conditions every item meets, by field (a dotted path that follows references): a plain value is equality; or one
   * test: `{ "in": [...] }`, `{ "has": value }` (a list field holds it), `{ "not": value }`, `{ "before": date }`,
   * `{ "after": date }` (ISO dates; `"today"` is the reader's date). Values may be `{ "item": … }` on an item's page.
   */
  where?: Record<string, unknown>;
  /** A field, or several, to sort by; `-` first for descending (`"-date"`). */
  sort?: string | string[];
  limit?: number;
  /** The fields a block needs, each from an item path: `{ "title": "name", "meta": "book.title" }`. Without it the whole item. */
  select?: Record<string, string>;
}

/** A list binding: `{ "from": "talks", … }` (only the binding's own keys). */
export const isBinding = (v: unknown): v is Binding => isObject(v) && typeof v.from === 'string' && only(v, 'from', 'where', 'sort', 'limit', 'select');

const dateOf = (v: unknown, today: string) => (v === 'today' ? today : String(v));

/** Whether a value meets a `where` test (see `Binding`). */
export function meets(value: unknown, test: unknown, today = new Date().toISOString().slice(0, 10)): boolean {
  if (isObject(test) && Object.keys(test).length === 1) {
    const [op, arg] = Object.entries(test)[0];
    if (op === 'in' && Array.isArray(arg)) return arg.some((a) => same(value, a));
    if (op === 'has') return Array.isArray(value) && value.some((v) => same(v, arg));
    if (op === 'not') return !same(value, arg);
    if (op === 'before') return value !== undefined && String(value) < dateOf(arg, today);
    if (op === 'after') return value !== undefined && String(value) >= dateOf(arg, today);
  }
  return same(value, test);
}

const same = (a: unknown, b: unknown) => (isRef(a) && typeof b === 'string' ? a.ref === b || a.ref.endsWith(`/${b}`) : a === b);

function compare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

/** The item with this id in a collection, or `undefined`. */
export function findItem(collection: CollectionDocument | undefined, id: string): Item | undefined {
  if (!collection) return undefined;
  const key = collection.idField ?? 'id';
  return collection.items.find((item) => String(item[key]) === id);
}

/** The page that shows each item of a collection on its own (its route holds `:id`). */
export const itemPage = (site: Pick<Site, 'pages'>, collection: string): PageDocument | undefined => site.pages.find((p) => p.collection === collection && p.route.includes(':id'));

/** The route of an item's own page, such as `/readings/the-long-shore`, when the collection has one. */
export function itemRoute(site: Pick<Site, 'pages'>, collection: string, id: string): string | undefined {
  const page = itemPage(site, collection);
  return page ? page.route.replace(':id', encodeURIComponent(id)) : undefined;
}

export interface ResolveDataOptions {
  /** The item an item's page shows, for `{ "item": … }` values. */
  item?: Item;
  /** The collection that item belongs to. */
  collection?: string;
  /** Told of a reference or path that finds nothing (the content check reports the same). */
  missing?: (what: string) => void;
  /** The date `"today"` means in a binding's `before` and `after`, as `YYYY-MM-DD`; defaults to the reader's. */
  today?: string;
}

/**
 * Resolves every `{ "ref": … }` and `{ "item": … }` in a value. A reference to a whole item gives the item, its own
 * references resolved and, when its collection has an item page, `href` set to that page (unless the item has one).
 * A dotted `field` or `item` path follows references along the way. What isn't found is left out (`undefined`).
 */
export function resolveData<T>(value: T, site: Pick<Site, 'pages' | 'collections'>, options: ResolveDataOptions = {}): T {
  const seen = new Set<string>();
  const withAddress = (collection: string, item: Item): Item => {
    const id = String(item[site.collections[collection]?.idField ?? 'id']);
    const href = itemRoute(site, collection, id);
    return href && item.href === undefined ? { ...item, href } : item;
  };
  const refItem = (ref: string): Item | undefined => {
    const [collection, id] = ref.split('/');
    const found = findItem(site.collections[collection], id);
    if (!found) {
      options.missing?.(`“${ref}” isn’t an item of a collection`);
      return undefined;
    }
    if (seen.has(ref)) return withAddress(collection, found);
    seen.add(ref);
    const resolved = walk(withAddress(collection, found)) as Item;
    seen.delete(ref);
    return resolved;
  };
  const path = (from: unknown, dotted: string, label: string): unknown => {
    let at: unknown = from;
    for (const part of dotted.split('.')) {
      if (isRef(at)) at = refItem(at.ref);
      at = isObject(at) ? at[part] : undefined;
      if (at === undefined) {
        options.missing?.(`${label} has no “${dotted}”`);
        return undefined;
      }
    }
    return walk(at);
  };
  function walk(v: unknown): unknown {
    if (isRef(v)) return v.field ? path(refItem(v.ref), v.field, `“${v.ref}”`) : refItem(v.ref);
    if (isItemValue(v)) return options.item ? path(options.item, v.item, `the ${options.collection ?? ''} item`.replace('  ', ' ')) : undefined;
    if (isBinding(v)) return bind(v);
    if (Array.isArray(v)) return v.flatMap((x) => (isBinding(x) ? (bind(x) as unknown[]) : [walk(x)])).filter((x) => x !== undefined);
    if (isObject(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]).filter(([, x]) => x !== undefined));
    return v;
  }
  // A list binding (DP13): the collection's items that meet `where`, in `sort` order, at most `limit`, each with its
  // address, references resolved and, with `select`, its fields renamed for the block that shows it.
  function bind(b: Binding): unknown[] {
    const collection = site.collections[b.from];
    if (!collection) {
      options.missing?.(`“${b.from}” isn’t a collection`);
      return [];
    }
    const where = (b.where ? walk(b.where) : {}) as Record<string, unknown>;
    const value = (item: Item, dotted: string) => {
      let at: unknown = item;
      for (const part of dotted.split('.')) {
        if (isRef(at)) at = findItem(site.collections[at.ref.split('/')[0]], at.ref.split('/')[1]);
        at = isObject(at) ? at[part] : undefined;
      }
      return at;
    };
    const items = collection.items.filter((item) => Object.entries(where).every(([field, test]) => meets(value(item, field), test, options.today)));
    const order = (Array.isArray(b.sort) ? b.sort : b.sort ? [b.sort] : []).map((s) => (s.startsWith('-') ? { field: s.slice(1), dir: -1 } : { field: s, dir: 1 }));
    if (order.length)
      items.sort((x, y) => {
        for (const { field, dir } of order) {
          const c = compare(value(x, field), value(y, field));
          if (c) return c * dir;
        }
        return 0;
      });
    const chosen = typeof b.limit === 'number' ? items.slice(0, b.limit) : items;
    return chosen.map((item) => {
      const full = walk(withAddress(b.from, item)) as Item;
      if (!b.select) return full;
      return Object.fromEntries(Object.entries(b.select).map(([to, from]) => [to, path(full, from, `a ${b.from} item`)]).filter(([, x]) => x !== undefined));
    });
  }
  return walk(value) as T;
}
