/** The coss template (Q168): its manifest, content JSON and its registry. */
import manifest from './template.json';
import assets from './assets.json';
import { loadTemplate } from '../load';
import { registry } from './registry';

export default loadTemplate(
  manifest,
  import.meta.glob('./content/**/*.json', { eager: true, import: 'default' }),
  assets,
  import.meta.glob('./assets/*', { eager: true, query: '?url', import: 'default' }),
  registry,
);
