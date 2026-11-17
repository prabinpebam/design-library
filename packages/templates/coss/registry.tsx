/** The coss template's registry (Q168): ShowcaseLayout draws the shared record as one scrollable component catalogue. */
import type { Template } from '@design-library/core/render';
import './tokens/theme.css';
import { CossApp } from './CossApp';
import type { CossRecord } from './types';

export const registry: Template['registry'] = {
  layouts: {
    ShowcaseLayout: ({ shared }) => <CossApp view={shared?.record as unknown as CossRecord} />,
  },
};

export { CossApp };
