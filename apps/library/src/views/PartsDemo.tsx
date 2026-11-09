/**
 * A template's own blocks placed from page documents (DP18): `site.html?demo=parts&template=conference#/`. Each block
 * type's manifest example on its own page, through the template's registry, drawn by `SiteView` from `partsSite`.
 * View data only; no styles.
 */
import { useMemo } from 'react';
import { FloatingBar, SchemeControl, Text } from '@design-library/core/react';
import { partsSite, SiteView } from '@design-library/core/render';
import { templateOf } from '@design-library/templates';

export function PartsDemo({ template }: { template: string }) {
  const source = templateOf(template);
  const site = useMemo(() => (source ? partsSite(source) : undefined), [source]);
  if (!site?.pages.length) return <Text as="p">{`“${template}” has no block types with an example in its manifest.`}</Text>;
  return (
    <>
      <SiteView site={site} />
      <FloatingBar label="Preview">
        <SchemeControl iconOnly storageKey={`template-site.${template}.scheme`} />
      </FloatingBar>
    </>
  );
}
