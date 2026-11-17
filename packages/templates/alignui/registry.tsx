/** The alignui template's registry (Q169): ShowcaseLayout draws the shared record as one scrollable component catalogue. */
import type { Template } from '@design-library/core/render';
import './tokens/theme.css';
import { AlignuiApp } from './AlignuiApp';
import type { AlignuiRecord } from './types';

export const registry: Template['registry'] = {
  layouts: {
    ShowcaseLayout: ({ shared }) => <AlignuiApp view={shared?.record as unknown as AlignuiRecord} />,
  },
};

export { AlignuiApp };
