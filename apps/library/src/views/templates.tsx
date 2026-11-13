/**
 * Template layouts by route (Q62, Q64): `#/app/{template}/{layout}` renders one of these, every one through the one
 * renderer, TemplateView, from its template's content JSON (packages/templates).
 */
import type { ReactNode } from 'react';
import { TemplateView } from '@design-library/core/render';
import { templates } from '@design-library/templates';

/** A screen by its route path; the address's `?` values (`splitRoute`) reach the layout as `params`. */
export const layoutScreens: Record<string, (params?: Record<string, string>) => ReactNode> = Object.fromEntries(
  templates.flatMap((t) => t.manifest.layouts.filter((l) => !l.planned).map((l) => [`${t.manifest.id}/${l.id}`, (params?: Record<string, string>) => <TemplateView template={t} layout={l.id} params={params} />])),
);
// The F15.70 address keeps working.
layoutScreens.chat = layoutScreens['chat/chat'];
