/**
 * Templates, content and customization (Q64): the types of a template's manifest and content, which mirror the JSON
 * Schemas in `packages/core/schemas/` (the schemas are the contract; `npm run check:content` holds content to them
 * and holds the block registry equal to them).
 */
import type { ReactNode } from 'react';
import type { AgendaSlot, FooterLink, FooterSection, IconName, StoryFile } from '../react';

export type SiteAction = {
  label: string;
  /** The main action: one per part at most. */
  primary?: boolean;
} & (
  | {
      /** What the page says when it's pressed, while it leads nowhere in an example. */
      says: string;
      href?: undefined;
    }
  | {
      /** Where it goes (DP2): "/layout" (resolved by TemplateView's hrefFor), "#id" or an address; drawn as a link that looks like a button. */
      href: string;
      says?: string;
    }
);

/** A link in content: `/layout` of the same template, `https://…`, `mailto:…` or `#anchor`. */
export interface SiteLink {
  label: string;
  href: string;
  external?: boolean;
}

/** One field of a form block. */
export interface SiteField {
  id: string;
  label: string;
  kind: 'text' | 'email' | 'tel' | 'password' | 'search' | 'long' | 'choice';
  hint?: string;
  optional?: boolean;
  options?: string[];
  /** The failed screen state's kept answer (Q85.2 UI states): shown in the field when the form failed, so the fields
   * without one are the ones marked at fault. A failure that isn't about the answers gives every field one. */
  answer?: string;
  /** With `answer`: the words under the field when that kept answer is the fault ("Check for a missing @."). */
  invalid?: string;
}

/** What a form becomes in its own box once it's sent (Q65 TP2): the same shape as a status block. */
export interface SiteOutcome {
  eyebrow?: string;
  title: string;
  text: string;
  links: SiteLink[];
  note?: string;
}

/** A list with nothing in it (Q65 TP3): shown in the list's own box, in the screen's `empty` state. */
export interface SiteEmpty {
  reason: 'first-use' | 'cleared' | 'no-results' | 'no-access' | 'done';
  title: string;
  text: string;
  silhouette?: 'list' | 'tiles' | 'table';
  links?: SiteLink[];
}

/** A marked run of rich text (DP1): emphasis, strong, accent, code and link carry words; break starts a new line. */
export type RichRun =
  | string
  | { text: string; mark: 'emphasis' | 'strong' | 'accent' | 'code' }
  | { text: string; mark: 'link'; href: string }
  | { mark: 'break' };
/** Rich inline text in content (DP1): a plain string, or a list of strings and marked runs. No markup. */
export type RichText = string | RichRun[];

export type ProseItem =
  | { kind: 'heading'; text: RichText }
  | { kind: 'text'; text: RichText }
  | { kind: 'quote'; text: string; name?: string }
  | { kind: 'picture'; picture: string; caption: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'code'; label: string; code: string };

/** The core block set: one member per `$defs` entry of blocks.schema.json. Pictures are asset ids. */
export type CoreBlock =
  | { type: 'site-header'; name: string; mark?: IconName; places: { label: string; href: string }[]; actions?: SiteAction[] }
  | { type: 'site-footer'; sectionsLabel: string; sections: FooterSection[]; links: FooterLink[]; identity: string; legal: string }
  | {
      type: 'hero';
      eyebrow?: string;
      title: RichText;
      lead?: RichText;
      actions?: SiteAction[];
      note?: string;
      picture?: string;
      layout?: 'split' | 'stacked';
      /** A statement meant to be read on its own (a brand opening), so the page presents it framed. Leave it out on task and reference pages: their title and intro sit with their content (Q91). */
      standalone?: boolean;
    }
  | { type: 'stats'; heading: string; intro?: string; items: { label: string; value: number | string; unit?: string; description?: string }[] }
  | { type: 'cards'; heading: string; intro?: string; max?: 2 | 3 | 4; items: { title: string; eyebrow?: string; description: string; picture?: string; meta?: string; href?: string }[]; empty?: SiteEmpty }
  | { type: 'quote'; text: string; name: string; role: string }
  | { type: 'points'; heading: string; intro?: string; items: string[] }
  | { type: 'details'; heading: string; intro?: string; items: { term: string; details: string }[] }
  | { type: 'form'; heading: string; intro?: string; error?: string; outcome?: SiteOutcome; fields: SiteField[]; submit: string; sent: string; choose: string; enter: string; pick: string; links?: SiteLink[] }
  | { type: 'alert'; tone: 'info' | 'success' | 'warning' | 'error'; title?: string; text: string; links?: SiteLink[] }
  | { type: 'status'; eyebrow?: string; title: string; text: string; links: SiteLink[]; note?: string }
  | { type: 'search'; heading: string; label: string; button: string; query: string; summary: string; results: { title: string; href: string; description: string; eyebrow?: string }[]; none: { title: string; text: string; links?: SiteLink[] } }
  | { type: 'settings'; heading: string; intro?: string; saved: string; groups: { heading: string; items: { id: string; label: string; description?: string; kind: 'switch' | 'choice'; on?: boolean; value?: string; options?: string[] }[] }[]; links?: SiteLink[] }
  | { type: 'empty'; reason: 'first-use' | 'cleared' | 'no-results' | 'no-access' | 'done'; title: string; text: string; silhouette?: 'list' | 'tiles' | 'table'; links?: SiteLink[] }
  | {
      type: 'cta';
      title: RichText;
      lead: RichText;
      actions: SiteAction[];
      note?: string;
      /** A closing invitation meant to stand on its own (a marketing or editorial page's last word), so the page frames it. Leave it out on task pages, where the action is one more step of the work (Q91). */
      standalone?: boolean;
    }
  | { type: 'gallery'; heading?: string; label: string; layout?: 'standard' | 'quilted' | 'masonry'; items: string[] }
  | { type: 'breadcrumbs'; items: { label: string; href?: string }[] }
  | { type: 'byline'; name: string; href: string; date: string; read: string; picture?: string }
  | { type: 'person'; name: string; role: string; bio: string[]; portrait?: boolean; picture?: string }
  | { type: 'prose'; items: ProseItem[] }
  | { type: 'posts'; heading?: string; items: { title: string; eyebrow?: string; description: string; meta: string; picture?: string; href: string }[]; page?: number; pages?: number; pagingLabel?: string; empty?: SiteEmpty }
  | { type: 'people'; heading: string; intro?: string; items: { name: string; role: string; href?: string; picture?: string }[] }
  | { type: 'schedule'; heading?: string; daysLabel: string; days: { id: string; label: string; title: string; slots: AgendaSlot[] }[] }
  | { type: 'agenda'; heading: string; label: string; slots: AgendaSlot[]; empty?: SiteEmpty }
  | { type: 'tickets'; heading: string; intro?: string; currency: string; options: { value: string; label: string; price: number; description: string; meta?: string }[]; submit: string; sent: string; labels: { ticket: string; count: string; tickets: string; total: string; line: string } }
  | { type: 'questions'; heading: string; items: { title: string; text: string }[] };

/** Any block: a core one, or a template's own (`{template}.{name}`). */
export interface Block {
  type: string;
  [key: string]: unknown;
}

export interface TemplateRegion {
  id: string;
  shared?: true;
  accepts?: string[];
}

export interface TemplateLayoutDocs {
  summary?: string;
  regions?: { region: string; holds: string; uses: string }[];
  narrow?: string;
  try?: string[];
  notBuilt?: string[];
}

export interface TemplateLayoutEntry {
  id: string;
  title: string;
  planned?: true;
  component?: string;
  content?: string;
  regions?: TemplateRegion[];
  /** This layout is a state of another screen (its title names the state); shown on that screen's page. */
  stateOf?: string;
  docs?: TemplateLayoutDocs;
}

/** A flow: what a person gets done, and its screens (layout ids) in the order they meet them. */
export interface TemplateFlow {
  id: string;
  title: string;
  summary?: string;
  screens: string[];
}

/** A section of a template: flows that belong together (an account, the shop, help and errors). */
export interface TemplateSection {
  id: string;
  title: string;
  summary?: string;
  flows: TemplateFlow[];
}

export interface TemplatePart {
  name: string;
  source: string;
}

/** template.json, as template.schema.json defines it. */
export interface TemplateManifest {
  id: string;
  version: string;
  title: string;
  summary: string;
  contentSchema: string;
  contentVersion: number;
  shared?: string;
  assets?: string;
  theme?: { space?: string; shape?: string };
  layouts: TemplateLayoutEntry[];
  /** The home screen (Q67): first at the top level of the navigation, beside the sections; stored at content/{home}.json. */
  home?: string;
  /**
   * The grouped hierarchy (Q66, Q67): sections → flows → screens; states hang off their screen by `stateOf`. Groups
   * hold 3–5 items: a flow of 3+ screens is a group of its own; a shorter flow's screens sit in the section.
   */
  sections: TemplateSection[];
  parts?: { fundamentals?: TemplatePart[]; compounds?: TemplatePart[]; layouts?: TemplatePart[]; blocks?: { type: string; schema: string; renders: string }[] };
}

/** One content file, as content.schema.json defines it. */
export interface TemplateContent {
  template: string;
  layout?: string;
  shared?: true;
  contentVersion: number;
  settings?: Record<string, unknown>;
  regions?: Record<string, Block[]>;
  record?: Record<string, unknown>;
  /** Shared file only: words the renderer needs that no block holds; `unconfirmed` maps each kind of unconfirmed value to its phrase (DP4). */
  strings?: { unconfirmed?: Record<string, string> };
}

/**
 * A value not yet confirmed (DP4): allowed wherever content takes core text, and shown as the shared file's phrase for
 * its key. The renderer resolves it before blocks see it, so block types keep their plain `string` fields.
 */
export type Unconfirmed = { unconfirmed: string };

/** A picture tone (DP3): drawn by the picture treatments (IP31). */
export type PictureTone = 'none' | 'greyscale' | 'duotone';

export interface TemplateAsset {
  src: string;
  /** Empty when the picture is decorative. */
  alt: string;
  /** The frame where the block doesn't fix one, as `Image` `ratio` (DP3). */
  ratio?: 'ultrawide' | 'wide' | 'photo' | 'classic' | 'square' | 'portrait' | 'natural';
  /** The point to keep in view when the frame crops, 0 to 1, as `Image` `focal` (DP3). */
  focal?: { x: number; y: number };
  /** How it is toned, always or at rest and when active (DP3). */
  treatment?: PictureTone | { rest?: PictureTone; active?: PictureTone };
  /** Adds nothing the words don't say: drawn with an empty alt (DP3). */
  decorative?: boolean;
}

/** What a block or layout renderer is given besides its data. */
export interface RenderContext {
  template: string;
  /** The current layout's id and its layout component's settings. */
  layout: string;
  settings: Record<string, unknown>;
  /**
   * The screen state this layout shows (Q65 TP2–TP3): a state layout that inherits its screen's content names it in
   * `settings.state` (`failed`, `done`, `empty`); blocks that know the state draw it in their own box, through Morph.
   */
  state?: string;
  /** The address of another layout of this template, as the host serves it. */
  href: (layout: string) => string;
  /** A picture by its asset id (an unknown id gives an empty source and alt, which the check prevents). */
  picture: (id: string) => TemplateAsset;
  /** Renders blocks through the registry: core blocks, then the template's own. */
  blocks: (blocks: Block[] | undefined) => ReactNode;
  /** How many blocks share the region being rendered: a stage alone in its region is framed distraction-free (Q90). */
  siblings?: number;
  /** The blocks sharing that region, in order: a block reads its neighbours (two framed blocks never sit side by side, FR9). */
  neighbours?: Block[];
  /** The layout region being filled, for its top-level blocks only: framing applies in the page's `main` region, never in a side column or inside another block (Q89.2). */
  region?: string;
}

export type BlockRenderer<B = Block> = (block: B, ctx: RenderContext, key: number) => ReactNode;

/** A layout binding: places a content file's regions (or record) in a layout component. */
export type LayoutBinding = (args: {
  content: TemplateContent;
  /** The template's shared file (links resolved), when it has one: shared regions or a shared record. */
  shared?: TemplateContent;
  /** Another layout's content in the same template (an app's screens read one another's records). */
  contentOf: (layout: string) => TemplateContent | undefined;
  ctx: RenderContext;
  region: (id: string) => ReactNode;
}) => ReactNode;

/** A template as the renderer reads it: the manifest, its content files by layout id, its pictures and its own registry. */
export interface Template {
  manifest: TemplateManifest;
  content: Record<string, TemplateContent>;
  shared?: TemplateContent;
  assets: Record<string, TemplateAsset>;
  /** The template's own block types (namespaced) and layout components (core names or namespaced). */
  /** The stories of its own parts (parts/), shown on its Parts page in the library. */
  stories?: StoryFile[];
  registry?: { // eslint-disable-next-line @typescript-eslint/no-explicit-any -- each entry narrows its own block
  blocks?: Record<string, BlockRenderer<any>>; layouts?: Record<string, LayoutBinding> };
}

/** A site's navigation place (site.schema.json `navigation`). */
export interface SiteNavigationItem {
  label: string;
  /** A route: `/` or lowercase parts after a slash. */
  href: string;
}

/** The site document, as site.schema.json (version 1) defines it (DP8): what every page shares. */
export interface SiteDocument {
  siteVersion: 1;
  id?: string;
  title: string;
  /** `{page}` and `{site}`; default `{page} · {site}`. */
  titlePattern?: string;
  /** The id of the page at `/`. */
  home: string;
  /** The id of the page shown for an unknown address. */
  notFound?: string;
  navigation?: SiteNavigationItem[];
  header?: Block[];
  footer?: Block[];
  layout?: { component?: string; settings?: Record<string, unknown> };
  transition?: 'none' | 'fade';
  /** Old or extra addresses → the route each opens. */
  aliases?: Record<string, string>;
  strings?: {
    notFound?: { title: string; text: string; home: string };
    unconfirmed?: Record<string, string>;
    scheme?: Partial<Record<'light' | 'dark' | 'system' | 'switch' | 'toDark' | 'toLight', string>>;
  };
}

/** A page section: a block with an optional anchor (page.schema.json `$defs.section`). */
export type PageSection = Block & { anchor?: string };

/** On an item's page: one value of the item shown, by a dotted path (collection.schema.json `$defs.item`). */
export type ItemValue = { item: string };

/** A reference to a collection's item, or one value of it (collection.schema.json `$defs.ref`). */
export type ItemRef = { ref: string; field?: string };

/** A collection, as collection.schema.json (version 1) defines it (DP12). */
export interface CollectionDocument {
  collectionVersion: 1;
  id: string;
  title?: string;
  /** The item field holding its id; default `id`. */
  idField?: string;
  /** The JSON schema every item meets. */
  item?: Record<string, unknown>;
  items: Record<string, unknown>[];
}

/** One page, as page.schema.json (version 1) defines it (DP9). */
export interface PageDocument {
  pageVersion: 1;
  id: string;
  route: string;
  /** The collection whose items this page shows one at a time (its route holds `:id`). */
  collection?: string;
  title: string | ItemValue;
  windowTitle?: string;
  description?: string | ItemValue;
  /** An asset id for link previews. */
  picture?: string | ItemValue;
  canonical?: string;
  hidden?: boolean;
  /** The navigation place it belongs to (a route without its slash); defaults to the first part of its route. */
  current?: string;
  layout?: string;
  settings?: Record<string, unknown>;
  sections: PageSection[];
}

/** A data-driven site as `SiteView` reads it: the site document, its pages, its pictures and its own registry. */
export interface Site {
  site: SiteDocument;
  pages: PageDocument[];
  /** Collections by id (DP12). */
  collections: Record<string, CollectionDocument>;
  assets: Record<string, TemplateAsset>;
  registry?: Template['registry'];
}
