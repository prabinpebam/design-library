/** The Design tool template: its manifest, content JSON, pictures and its registry (the layout binding). */
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
