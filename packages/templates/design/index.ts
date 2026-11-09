/** The Design tool template: its manifest, content JSON and its registry (the layout binding). */
import manifest from './template.json';
import { loadTemplate } from '../load';
import { registry } from './registry';

export default loadTemplate(
  manifest,
  import.meta.glob('./content/**/*.json', { eager: true, import: 'default' }),
  undefined,
  {},
  registry,
);
