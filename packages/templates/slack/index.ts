/** Slack workspace: started with design-library-new-template. */
import type { StoryFile } from '@design-library/core/components';
import { loadTemplate } from '../load';
import manifest from './template.json';
import assets from './assets.json';
import { registry } from './registry';

export default loadTemplate(
  manifest,
  import.meta.glob('./content/**/*.json', { eager: true, import: 'default' }),
  assets,
  import.meta.glob('./assets/*', { eager: true, query: '?url', import: 'default' }),
  registry,
  Object.values(import.meta.glob<StoryFile>('./parts/*/*.stories.tsx', { eager: true, import: 'default' })),
);
