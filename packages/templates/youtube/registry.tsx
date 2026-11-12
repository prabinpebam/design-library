/**
 * The video site template's registry: its one layout, mapped to its own part under the `youtube` namespace. Core blocks
 * and core layouts need no entry here.
 */
import type { Template } from '@design-library/core/render';
import { Site } from './parts/layouts/Site';
import type { YoutubeRecord } from './types';
import './tokens/tokens.css';
import './tokens/theme.css';
import './parts/layouts/site.css';

export const registry: Template['registry'] = {
  blocks: {},
  layouts: {
    SiteLayout: ({ shared, ctx }) => <Site view={shared?.record as unknown as YoutubeRecord} screen={ctx.layout} />,
  },
};
