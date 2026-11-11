/** The IKEA store template (owner Q137): its manifest, content JSON, pictures, its registry (the layout binding) and its own parts' stories (Q138). */
import type { StoryFile } from '@design-library/core/components';
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
  Object.values(import.meta.glob<StoryFile>('./parts/*/*.stories.tsx', { eager: true, import: 'default' })),
);
