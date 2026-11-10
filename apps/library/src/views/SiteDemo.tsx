/**
 * A data-driven site (DP8, DP9): `site.html?demo=site#/`. Harbour Books from its site document and page documents
 * alone, drawn by `SiteView` on the core router; addresses, titles, navigation, anchors, the old addresses and the
 * not-found page all come from the JSON. View data only; no styles.
 */
import { FloatingBar, SchemeControl } from '@design-library/core/components';
import { SiteView } from '@design-library/core/render';
import harbour from '@design-library/templates/harbour/site';

export function SiteDemo() {
  return (
    <>
      <SiteView site={harbour} />
      <FloatingBar label="Preview">
        <SchemeControl iconOnly storageKey="template-site.harbour-site.scheme" />
      </FloatingBar>
    </>
  );
}
