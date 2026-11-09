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
    if (Array.isArray(v)) return v.map(walk).filter((x) => x !== undefined);
    if (isObject(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]).filter(([, x]) => x !== undefined));
    return v;
  }
  return walk(value) as T;
}
