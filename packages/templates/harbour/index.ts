/** Harbour Books (Q76 worked example): built by following only packages/core/AGENTS.md and its guide, Step 6 "Start a template from nothing". */
import type { StoryFile } from '@design-library/core/components';
import manifest from './template.json';
import assets from './assets.json';
import { loadTemplate } from '../load';

export default loadTemplate(
  manifest,
  import.meta.glob('./content/**/*.json', { eager: true, import: 'default' }),
  assets,
  import.meta.glob('./assets/*', { eager: true, query: '?url', import: 'default' }),
  undefined,
  Object.values(import.meta.glob<StoryFile>('./parts/*/*.stories.tsx', { eager: true, import: 'default' })),
);
