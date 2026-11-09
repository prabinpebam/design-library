/**
 * Harbour Books as a data-driven site (DP8, DP9, DP12; ID19's reference site): the site document, its page documents,
 * two collections (books, readings) and the template's own pictures, drawn by `SiteView`. Every word, section and
 * item is in the JSON beside this file.
 */
import { loadSite } from '@design-library/core/render';
import site from './site.json';
import assets from '../assets.json';

const urls = import.meta.glob('../assets/*', { eager: true, query: '?url', import: 'default' });

export default loadSite({
  site,
  pages: import.meta.glob('./pages/*.json', { eager: true, import: 'default' }),
  collections: import.meta.glob('./collections/*.json', { eager: true, import: 'default' }),
  assets,
  assetUrls: Object.fromEntries(Object.entries(urls).map(([path, url]) => [path.replace(/^\.\.\//, './'), url])),
});
