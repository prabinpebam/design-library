/**
 * Templates, content and customization (Q64): the types of a template's manifest and content, which mirror the JSON
 * Schemas in `packages/core/schemas/` (the schemas are the contract; `npm run check:content` holds content to them
 * and holds the block registry equal to them).
 */
import type { ReactNode } from 'react';
import type { AgendaSlot, FooterLink, FooterSection, IconName, IllustrationPlay, MediaPlayerProps, StoryFile } from '../react/components';
import type { PageGridRecord } from './page-grid';
import type { PictureReveal } from '../react/behaviour/reveal';
import type { PictureSource, PictureTreatment } from '../react/fundamentals/Image';

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
  /**
   * @deprecated (LR24, composition rule) Pictures are placed on the page: a `media` block (one `picture`, `caption`,
   * `ratio`, `frame`) between prose blocks, or an `illustration` block for drawn art. Still drawn.
   */
  | { kind: 'picture'; picture: string; caption: string; /** Decoration over the picture (MP9, LR20): a template decoration preset's name. A list of blocks is deprecated. */ decoration?: Decoration }
  | { kind: 'list'; items: string[] }
  | { kind: 'code'; label: string; code: string };

/**
 * A decoration over a picture (MP9, LR20): the name of one of the template's decoration presets (`registry.decorations`).
 * A list of the template's own blocks is the deprecated older form, still drawn: it opened a block to any content.
 */
export type Decoration = string | Block[];

/** One picture of an album: an asset id and what this album says about it (blocks.schema `albumItem`). */
export interface AlbumItem {
  picture: string;
  /** Opt-in playable item; `picture` remains its poster asset. Absent keeps the existing picture presentation. */
  video?: Pick<MediaPlayerProps, 'source' | 'title' | 'duration' | 'shape'>;
  caption?: string;
  credit?: string;
  /** Replaces the asset's alternative text here. */
  alt?: string;
  /** Grey at rest, its colour while hovered or focused (see `MediaReveal`). */
  reveal?: MediaReveal;
}

/**
 * Grey at rest, its colour while hovered or focused (G4). `true` draws the change with the template's `default` reveal
 * preset (`registry.reveals`) when it has one, else as the picture's tone (a fade from greyscale); a name picks another
 * preset. Reduced motion, and a name the template doesn't have, keep the fade.
 */
export type MediaReveal = boolean | string;

/** Pictures in order, reusable across blocks: an `albums` collection item (by `{ ref }`) or written in the block. */
export interface Album {
  id?: string;
  title?: string;
  items: AlbumItem[];
}

/**
 * A picture as a template's media presentation receives it (G2): `Image`'s props, resolved from the asset and the album
 * item (scheme versions, tone, pair and reveal included), with the album's words.
 */
export interface MediaPicture {
  id: string;
  src: string;
  /** The resolved asset's one fallback address, as Image's single retry. */
  fallbackSrc?: string;
  alt: string;
  dark?: string | PictureSource;
  contrast?: { light?: string | PictureSource; dark?: string | PictureSource };
  treatment?: PictureTreatment;
  alternate?: string | PictureSource;
  reveal?: PictureReveal;
  focal?: { x: number; y: number };
  caption?: string;
  credit?: string;
  /** The resolved album item's optional player, for a template presentation. */
  video?: AlbumItem['video'];
}

/** What a template's media presentation draws (G2): the pictures in order, the region's name and the block's choices. */
export interface MediaPresentationProps {
  pictures: MediaPicture[];
  /** Names the set, for a region or a list. */
  label: string;
  /** The block's variant, when the presentation has its own. */
  variant?: string;
  ratio?: TemplateAsset['ratio'];
  /** The block's framing switch (G3): `true` on, `false` off, absent the presentation's own default. */
  frame?: boolean;
  /** The block's depth motion switch (G3): `true` on, `false` off, absent the presentation's own default. Reduced motion is the presentation's to honour. */
  depth?: boolean;
}

/** A template's own presentation of an album (G2): a collage, a stack. Registered by name in `registry.presentations`. */
export type MediaPresentation = (props: MediaPresentationProps) => ReactNode;

/**
 * A template's framing art for one picture (G3): drawn behind it (`under`) and over it (`over`) through `Image`'s
 * `under` and `decoration` layers, the picture's own size, hidden from screen readers and never taking the pointer.
 * `room` (CSS padding, percentages of the box's width) is kept around the picture for the art's spill, so the art stays
 * in the picture's own box (its column or cell); the picture and its art are one isolated group, so an overprint never
 * blends with the page. `index` and `count` place the picture in its set, so a frame can vary.
 */
export type MediaFrame = (picture: { index: number; count: number }) => { under?: ReactNode; over?: ReactNode; room?: string };

/**
 * One picture of a media block as its depth motion moves it (G3). Framed: `box` is the picture's layers (positioned),
 * holding the picture (`pictures`) and its framing art's layers (`shapes`, behind and over). Unframed: `box` is the
 * picture's own frame, which clips (`clips`), and `pictures` are the files inside it, so a motion pans them.
 */
export interface MediaDepthPicture {
  box: HTMLElement;
  pictures: HTMLElement[];
  shapes: HTMLElement[];
  clips: boolean;
}

/**
 * A template's depth motion (G3): attached to the block's group while the block's `depth` is on and reduced motion
 * isn't, with its pictures (read again on every call); returns its cleanup. The library detaches it when reduced
 * motion turns on and attaches it again when it turns off. Ranges are best taken from each picture's own box.
 */
export type MediaMotion = (group: HTMLElement, pictures: () => MediaDepthPicture[]) => (() => void) | void;

/** A bento picture's cells (LR30). */
export type MediaSpan = 'wide' | 'tall' | 'large' | 'none';

/** One picture, or an album shown by a presentation and its variant (blocks.schema `media`; owner, DesignUp 02:36). */
export type MediaBlock = {
  type: 'media';
  heading?: string;
  size?: SectionTitleSize;
  label?: string;
  /** Core `single`, `grid` or `carousel`, or a template presentation's name (`registry.presentations`, G2). */
  presentation?: 'single' | 'grid' | 'carousel' | (string & {});
  variant?: 'standard' | 'quilted' | 'masonry' | 'justified' | 'one' | 'peek' | 'few' | 'thumbnails' | (string & {});
  ratio?: TemplateAsset['ratio'];
  /** Framing switch (G3): the template's `default` frame (`true`) or one by name (`registry.frames`); off by default. */
  frame?: boolean | string;
  /** Depth motion switch (G3): the template's `registry.motions.depth`; off by default, and off under reduced motion. */
  depth?: boolean;
  /**
   * Grid quilted (bento), LR30: each picture's cells by position: `wide` (two columns), `tall` (two rows), `large`
   * (both) or `none`. Placement is the block's, not the album's. Without it the first picture is large.
   */
  spans?: MediaSpan[];
} & ({ picture: string; caption?: string; credit?: string; reveal?: MediaReveal; album?: never } | { album: Album; picture?: never });

/** A block's section title at the top steps of the type ramp (MP16); without it the usual section size. */
export type SectionTitleSize = 'display' | 'jumbo';

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
      /** Blocks in the picture's place (DP11 slot `hero.media`), when there's no `picture`. */
      media?: Block[];
      /** Decoration over the picture (MP9, LR20): a template decoration preset's name. Only with picture. A list of blocks is deprecated. */
      decoration?: Decoration;
      /** Lines of room kept for the title and the lead (MP7), so a series of pages keeps one opening height. */
      reserve?: { title?: number; lead?: number };
    }
  | { type: 'stats'; heading: string; size?: SectionTitleSize; intro?: string; items: { label: string; value: number | string; unit?: string; description?: string }[] }
  | { type: 'cards'; heading: string; size?: SectionTitleSize; intro?: string; max?: 2 | 3 | 4; items: { title: string; eyebrow?: string; description: string; picture?: string; meta?: string; href?: string }[]; empty?: SiteEmpty }
  | { type: 'quote'; text: string; name: string; role: string }
  | { type: 'points'; heading: string; size?: SectionTitleSize; intro?: string; items: string[] }
  | { type: 'details'; heading: string; size?: SectionTitleSize; intro?: string; items: { term: string; details: string }[] }
  | { type: 'form'; heading: string; size?: SectionTitleSize; intro?: string; error?: string; outcome?: SiteOutcome; fields: SiteField[]; submit: string; sent: string; choose: string; enter: string; pick: string; links?: SiteLink[] }
  | { type: 'alert'; tone: 'info' | 'success' | 'warning' | 'error'; title?: string; text: string; links?: SiteLink[] }
  | { type: 'status'; eyebrow?: string; title: string; text: string; links: SiteLink[]; note?: string }
  | { type: 'search'; heading: string; size?: SectionTitleSize; label: string; button: string; query: string; summary: string; results: { title: string; href: string; description: string; eyebrow?: string }[]; none: { title: string; text: string; links?: SiteLink[] } }
  | { type: 'settings'; heading: string; size?: SectionTitleSize; intro?: string; saved: string; groups: { heading: string; items: { id: string; label: string; description?: string; kind: 'switch' | 'choice'; on?: boolean; value?: string; options?: string[] }[] }[]; links?: SiteLink[] }
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
  | { type: 'gallery'; heading?: string; size?: SectionTitleSize; label: string; layout?: 'standard' | 'quilted' | 'masonry'; items: string[] }
  | MediaBlock
  | { type: 'breadcrumbs'; items: { label: string; href?: string }[] }
  | { type: 'illustration'; picture: string; ratio?: 'ultrawide' | 'wide' | 'photo' | 'classic' | 'square' | 'portrait' | 'natural' }
  | { type: 'byline'; name: string; href: string; date: string; read: string; picture?: string }
  | { type: 'person'; name: string; role: string; bio: string[]; portrait?: boolean; picture?: string }
  | { type: 'prose'; items: ProseItem[] }
  | { type: 'posts'; heading?: string; size?: SectionTitleSize; items: { title: string; eyebrow?: string; description: string; meta: string; picture?: string; href: string }[]; page?: number; pages?: number; pagingLabel?: string; empty?: SiteEmpty }
  | { type: 'people'; heading: string; size?: SectionTitleSize; intro?: string; items: { name: string; role: string; href?: string; picture?: string }[] }
  | { type: 'schedule'; heading?: string; size?: SectionTitleSize; daysLabel: string; days: { id: string; label: string; title: string; slots: AgendaSlot[] }[] }
  | { type: 'agenda'; heading: string; size?: SectionTitleSize; label: string; slots: AgendaSlot[]; empty?: SiteEmpty }
  | { type: 'tickets'; heading: string; size?: SectionTitleSize; intro?: string; currency: string; options: { value: string; label: string; price: number; description: string; meta?: string }[]; submit: string; sent: string; labels: { ticket: string; count: string; tickets: string; total: string; line: string } }
  | { type: 'questions'; heading: string; size?: SectionTitleSize; items: { title: string; text: string }[] }
  /**
   * Two columns of blocks side by side (DP11 slots `split.start` and `split.end`), stacking when narrow.
   * @deprecated A page inside a block (composition rule, LR18): put the blocks side by side with the page's `grid`.
   */
  | { type: 'split'; heading?: string; size?: SectionTitleSize; intro?: string; ratio?: '2:1' | '3:2' | '1:2' | '2:3' | 'aside'; start: Block[]; end: Block[] }
  /**
   * Blocks in equal columns (DP11 slot `grid.items`).
   * @deprecated A page inside a block (composition rule, LR18): put the blocks side by side with the page's `grid`.
   */
  | { type: 'grid'; heading?: string; size?: SectionTitleSize; intro?: string; max?: 2 | 3 | 4; items: Block[] };

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
  parts?: { fundamentals?: TemplatePart[]; compounds?: TemplatePart[]; layouts?: TemplatePart[]; blocks?: TemplateBlockPart[] };
}

/** One of a template's own block types (template.schema.json `parts.blocks`). */
export interface TemplateBlockPart {
  /** Namespaced: `{template}.{name}`. */
  type: string;
  /** Its schema in the content schema: `#/$defs/…`. */
  schema: string;
  /** The component that draws it. */
  renders: string;
  /** A sample block of this type, valid against its schema (DP18): what stories, previews and `partsSite` start from. */
  example?: Block;
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
  /** One fallback address if the picture fails, as Image's single retry. Default none. */
  fallbackSrc?: string;
  /** The same picture for a dark scheme, resolved to its address (MP18; `assets.json` `dark`). */
  dark?: string;
  /** Files for more contrast, resolved to their addresses (MP18; `assets.json` `contrast`). */
  contrast?: { light?: string; dark?: string };
  /** The paired picture shown while the picture is hovered or focused, resolved to its address (MP10; `assets.json` `alternate`). */
  alternate?: string;
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
  /** Set by the renderer on the page's first picture (DR44): it loads at once, ahead of the rest (`Image` `priority`). */
  priority?: boolean;
  /** Drawn inline as an `Illustration` (MP22; `assets.json` `illustration`): token colours, size groups, motion parts. */
  illustration?: { play?: IllustrationPlay };
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
  /** A template decoration preset by name (LR20), or undefined when the template has none by that name. */
  decoration?: (name: string) => ReactNode | undefined;
  /** A template reveal preset by name (G4), or undefined when the template has none by that name. */
  reveal?: (name: string) => PictureReveal | undefined;
  /** A template media presentation by name (G2), or undefined when the template has none by that name. */
  presentation?: (name: string) => MediaPresentation | undefined;
  /** A template frame by name (G3), or undefined when the template has none by that name. */
  frame?: (name: string) => MediaFrame | undefined;
  /** A template motion by name (G3, `depth`), or undefined when the template has none. */
  motion?: (name: 'depth') => MediaMotion | undefined;
  /** Told of a content problem the renderer finds (a block a slot doesn't accept); `SiteView` lists them in development. */
  problem?: (what: string) => void;
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
  blocks?: Record<string, BlockRenderer<any>>; layouts?: Record<string, LayoutBinding>;
  /** Decoration presets (LR20): art drawn over a picture (shapes, marks), by name; a hero or picture names one in `decoration`. */
  decorations?: Record<string, () => ReactNode>;
  /**
   * Reveal presets (G4): how a picture with `reveal` draws its change from grey to colour, as `Image` `reveal` draws
   * (MP11). `default` serves `reveal: true`; without it the change is the tone's fade.
   */
  reveals?: Record<string, PictureReveal>;
  /** Media presentations (G2): a template's own way to show an album (a collage), by name; a media block names one in `presentation`. */
  presentations?: Record<string, MediaPresentation>;
  /** Framing art (G3): a template's shapes around a picture, by name; a media block's `frame` switch draws `default` or a named one. */
  frames?: Record<string, MediaFrame>;
  /** Motions (G3): `depth` serves a media block's `depth` switch (scroll parallax, pointer repel); off under reduced motion. */
  motions?: { depth?: MediaMotion } };
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
  /** A link to the page already shown: nothing (`none`, default) or a glide back to the top (`top`, MP2). */
  again?: 'none' | 'top';
  /** Old or extra addresses → the route each opens (`:name` parts carry over), or an `https://` address. */
  aliases?: Record<string, string>;
  /** Values worked out from the collections when the site loads (DP14), read in content as `{ "derived": name }`. */
  derive?: Record<string, Derivation>;
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

/**
 * One derived value (site.schema.json `$defs.derivation`, DP14): exactly one of `count`, `distinct` or `group`, naming
 * a collection; `field` is a dotted item path (needed by `distinct` and `group`); `where` as a list binding's.
 */
export type Derivation = ({ count: string } | { distinct: string; field: string } | { group: string; field: string }) & { field?: string; where?: Record<string, unknown> };

/** A derived value in content: `{ "derived": "book-count" }` (collection.schema.json `$defs.derived`). */
export type DerivedValue = { derived: string };

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
  /** Provenance when a command wrote it (DP14): what wrote it, from what and when. */
  generated?: { by: string; from: string; at?: string };
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
  /** How this page replaces the one before it (over the site's `transition`). */
  transition?: 'none' | 'fade';
  /** With `collection`: moving between two of its items lands at the top (default) or keeps the place (`keep`, MP2). */
  between?: 'top' | 'keep';
  sections: PageSection[];
  /** The page's layout grid (LR18): rows and cells placing `sections` by index; unplaced sections follow as whole rows. */
  grid?: PageGridRecord;
}

/** A data-driven site as `SiteView` reads it: the site document, its pages, its pictures and its own registry. */
export interface Site {
  site: SiteDocument;
  pages: PageDocument[];
  /** Collections by id (DP12). */
  collections: Record<string, CollectionDocument>;
  /** The site document's `derive` values, worked out by `loadSite` (DP14). */
  derived?: Record<string, unknown>;
  assets: Record<string, TemplateAsset>;
  registry?: Template['registry'];
}
