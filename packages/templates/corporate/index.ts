/** The corporate template: its manifest, content JSON, pictures (and, when it has any, its own registry). */
import manifest from './template.json';
import assets from './assets.json';
import { loadTemplate } from '../load';

export default loadTemplate(
  manifest,
  import.meta.glob('./content/**/*.json', { eager: true, import: 'default' }),
  assets,
  import.meta.glob('./assets/*', { eager: true, query: '?url', import: 'default' }),
);
