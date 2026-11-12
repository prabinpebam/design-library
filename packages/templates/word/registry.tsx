/**
 * The document editor template's registry: one layout part under the `word` namespace. Core blocks and core layouts
 * need no entry here.
 */
import type { Template } from '@design-library/core/render';
import { Window } from './parts/layouts/Window';
import type { WordRecord } from './types';
import './tokens/tokens.css';
import './tokens/theme.css';
import './parts/layouts/window.css';

export const registry: Template['registry'] = {
  blocks: {},
  layouts: {
    SiteLayout: ({ shared, ctx }) => (
      <Window
        view={shared?.record as unknown as WordRecord}
        screen={ctx.layout}
        picture={ctx.picture}
      />
    ),
  },
};
