/**
 * Template layouts by route (Q62, Q64): `#/app/{template}/{layout}` renders one of these, every one through the one
 * renderer, TemplateView, from its template's content JSON (packages/templates).
 */
import type { ReactNode } from 'react';
import { TemplateView } from '@design-library/core/render';
import { templates } from '@design-library/templates';

export const layoutScreens: Record<string, () => ReactNode> = Object.fromEntries(
  templates.flatMap((t) => t.manifest.layouts.filter((l) => !l.planned).map((l) => [`${t.manifest.id}/${l.id}`, () => <TemplateView template={t} layout={l.id} />])),
);
// The F15.70 address keeps working.
layoutScreens.chat = layoutScreens['chat/chat'];
