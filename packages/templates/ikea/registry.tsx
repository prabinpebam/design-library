/**
 * The IKEA store template's registry (owner Q137): SiteLayout bound to the store (content/shared.json); the layout's
 * id says which screen. Every screen is the one app, so the bag holds from the product page to the checkout.
 */
import type { Template } from '@design-library/core/render';
import './tokens/theme.css';
import './tokens/tokens.css';
import './parts/fundamentals/notice.css';
import './parts/compounds/store-header.css';
import './parts/compounds/chip-rail.css';
import './parts/compounds/product-tile.css';
import './parts/compounds/picture-banner.css';
import './parts/compounds/offer-mosaic.css';
import './parts/compounds/chat-panel.css';
import './parts/compounds/offer-ticket.css';
import { IkeaApp, type StoreScreen } from './IkeaApp';
import type { StoreRecord } from './types';

export const registry: Template['registry'] = {
  layouts: {
    SiteLayout: ({ shared, ctx }) => (
      <IkeaApp view={shared?.record as unknown as StoreRecord} screen={ctx.layout as StoreScreen} at={ctx.href} picture={ctx.picture} />
    ),
  },
};

/** MP4: the template's own app, for a site that places it in its own views (`@design-library/templates/ikea/registry`: no content or pictures). */
export { IkeaApp };
