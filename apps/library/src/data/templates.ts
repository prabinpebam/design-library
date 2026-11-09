/**
 * Templates (Q62, Q64): a template is a named collection of layouts, each a full screen rendered from its content JSON
 * (packages/templates). This list is read from their manifests. The library's Templates section (an overview and one page per built layout) and the full-screen
 * routes `#/app/<template>/<layout>` read this list. Layouts not built yet are listed with `planned`.
 */
import { templates as jsonTemplates } from '@design-library/templates';
import type { Template as JsonTemplate } from '@design-library/core/render';

export interface TemplateRegion {
  region: string;
  holds: string;
  uses: string;
}

export interface TemplateLayout {
  id: string;
  title: string;
  /** Not built yet: listed on the overview only. */
  planned?: boolean;
  summary?: string;
  /** The layout component the screen is built on. */
  layout?: string;
  regions?: TemplateRegion[];
  /** What changes in a phone-sized window. */
  narrow?: string;
  try?: string[];
  notBuilt?: string[];
  /** A JSON template's layout (Q64): its content file and the template's shared file, with the JSON in each, shown beside the screen. */
  content?: { file: string; json: string }[];
  /** This layout is a state of another screen (Q66); its title names the state. */
  stateOf?: string;
}

/** A flow (Q66): what a person gets done, and its screens' layout ids in order. */
export interface TemplateFlow {
  id: string;
  title: string;
  summary?: string;
  screens: string[];
}

/** A section of a template (Q66): flows that belong together. */
export interface TemplateSection {
  id: string;
  title: string;
  summary?: string;
  flows: TemplateFlow[];
}

export interface Template {
  id: string;
  title: string;
  summary: string;
  layouts: TemplateLayout[];
  /** The home screen (Q67): first at the template's top level in the navigation. */
  home?: string;
  /** The grouped hierarchy (Q66): sections → flows → screens; states hang off their screen. */
  sections: TemplateSection[];
}

/** A JSON template (Q64) as the library lists it: its manifest's layouts and their docs, and each layout's content file. */
const fromManifest = ({ manifest, content, shared }: JsonTemplate): Template => ({
  id: manifest.id,
  title: manifest.title,
  summary: manifest.summary,
  sections: manifest.sections,
  home: manifest.home,
  layouts: manifest.layouts.map((l) => ({
    id: l.id,
    title: l.title,
    planned: l.planned,
    summary: l.docs?.summary,
    layout: l.component,
    regions: l.docs?.regions,
    narrow: l.docs?.narrow,
    try: l.docs?.try,
    notBuilt: l.docs?.notBuilt,
    stateOf: l.stateOf,
    content:
      l.content && content[l.id]
        ? [
            { file: `packages/templates/${manifest.id}/${l.content}`, json: JSON.stringify(content[l.id], null, 2) },
            ...(shared && manifest.shared ? [{ file: `packages/templates/${manifest.id}/${manifest.shared}`, json: JSON.stringify(shared, null, 2) }] : []),
          ]
        : undefined,
  })),
});

/** Every template, in the order packages/templates/index.ts lists them. */
export const templates: Template[] = jsonTemplates.map(fromManifest);

export const layoutOf = (route: string) => {
  const [template, layout] = route.split('/');
  const t = templates.find((x) => x.id === template);
  const l = t?.layouts.find((x) => x.id === layout && !x.planned);
  return t && l ? { template: t, layout: l } : undefined;
};

/** Where a screen sits (Q66): its section, its flow and its place in the flow. */
export const placeOf = (t: Template, screen: string) => {
  for (const section of t.sections)
    for (const flow of section.flows) {
      const index = flow.screens.indexOf(screen);
      if (index >= 0) return { section, flow, index };
    }
  return undefined;
};

/** A screen's states (Q66), in the manifest's order. */
export const statesOf = (t: Template, screen: string) => t.layouts.filter((l) => l.stateOf === screen);

/** Counts for the plan (Q66): screens and flows, built and planned, states apart. */
export const countsOf = (t: Template) => {
  const screens = t.layouts.filter((l) => !l.stateOf);
  const states = t.layouts.filter((l) => l.stateOf);
  const flows = t.sections.flatMap((s) => s.flows);
  const builtFlow = (f: TemplateFlow) => f.screens.some((id) => screens.some((l) => l.id === id && !l.planned));
  return {
    screens: screens.length,
    screensBuilt: screens.filter((l) => !l.planned).length,
    states: states.length,
    statesBuilt: states.filter((l) => !l.planned).length,
    flows: flows.length,
    flowsBuilt: flows.filter(builtFlow).length,
    flowsComplete: flows.filter((f) => f.screens.every((id) => screens.some((l) => l.id === id && !l.planned))).length,
  };
};
