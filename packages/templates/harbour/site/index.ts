/**
 * Harbour Books as a data-driven site (DP8, DP9; ID19's reference site): the site document, three page documents and
 * the template's own pictures, drawn by `SiteView`. Every word and section is in the JSON beside this file.
 */
import { loadSite } from '@design-library/core/render';
import site from './site.json';
import assets from '../assets.json';

const urls = import.meta.glob('../assets/*', { eager: true, query: '?url', import: 'default' });

export default loadSite(
  site,
  import.meta.glob('./pages/*.json', { eager: true, import: 'default' }),
  assets,
  Object.fromEntries(Object.entries(urls).map(([path, url]) => [path.replace(/^\.\.\//, './'), url])),
);
