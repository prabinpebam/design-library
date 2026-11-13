/**
 * The word-figma template's registry (Q161): EditorLayout bound to the shared record; each screen's settings name the
 * state it opens in (`text`, `comments`, `find`, `read`).
 */
import type { Template } from '@design-library/core/render';
import './tokens/theme.css';
import './parts/compounds/page.css';
import { WordFigmaApp, type WordFigmaScreen } from './WordFigmaApp';
import type { WordFigmaRecord } from './types';

export const registry: Template['registry'] = {
  layouts: {
    EditorLayout: ({ shared, content }) => (
      <WordFigmaApp key={String(content.settings?.screen ?? 'editor')} view={shared?.record as unknown as WordFigmaRecord} screen={content.settings?.screen as WordFigmaScreen | undefined} />
    ),
  },
};

export { WordFigmaApp };