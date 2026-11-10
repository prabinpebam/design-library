/**
 * The Design tool template's registry (Q64): EditorLayout bound to the record in content/edit/design/editor.json. A
 * screen with no record of its own (Prototype, Dev mode) shows the editor's, opened on the inspector tab its settings name, or in the mode they name (`present`, `comments`).
 */
import type { Template } from '@design-library/core/render';
import { DesignApp } from './DesignApp';
import type { DesignAppSpec } from './types';

export const registry: Template['registry'] = {
  layouts: {
    EditorLayout: ({ content, contentOf, ctx }) => (
      <DesignApp view={(content.record ?? contentOf('editor')?.record) as unknown as DesignAppSpec} tab={content.settings?.tab as string | undefined} mode={content.settings?.mode as 'present' | 'comments' | undefined} editorHref={ctx.href('editor')} height="screen" picture={(id) => ctx.picture(id).src || undefined} />
    ),
  },
};

/** MP4: the template's own app, for a site that places it in its own views (`@design-library/templates/design/registry`: no content or pictures). */
export { DesignApp };
