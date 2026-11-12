/**
 * The Slack workspace template's registry: its own block types and layouts, each mapped to its own parts, all under the
 * `slack` namespace. Core blocks and core layouts need no entry here.
 */
import type { Template } from '@design-library/core/render';
import { Workspace } from './parts/layouts/Workspace';
import type { WorkspaceRecord } from './types';
import './tokens/tokens.css';
import './tokens/theme.css';
import './parts/layouts/workspace.css';

const BLOCKS: Record<string, never> = {

};

export const registry: Template['registry'] = {
  blocks: BLOCKS,
  layouts: {
    SiteLayout: ({ content, shared, ctx }) => (
      <Workspace
        view={shared?.record as unknown as WorkspaceRecord}
        screen={ctx.layout}
        settings={content.settings}
        picture={ctx.picture}
      />
    ),
  },
};
