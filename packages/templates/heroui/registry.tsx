/** The heroui template's registry (Q172): ShowcaseLayout draws the shared record as one scrollable component catalogue. */
import type { Template } from '@design-library/core/render';
import './tokens/theme.css';
import { HerouiApp } from './HerouiApp';
import type { HerouiRecord } from './types';

export const registry: Template['registry'] = {
  layouts: {
    ShowcaseLayout: ({ shared }) => <HerouiApp view={shared?.record as unknown as HerouiRecord} />,
  },
};

export { HerouiApp };
