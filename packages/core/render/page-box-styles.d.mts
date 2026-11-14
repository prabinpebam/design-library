/** Types for page-box-styles.mjs: a Box's layout values per breakpoint, Webflow's way (LR156). */

/** Webflow's breakpoints: `main` (Desktop) is the base; large, xl and xxl cascade up; tablet, landscape and portrait down. */
export type BoxBreakpoint = 'main' | 'large' | 'xl' | 'xxl' | 'tablet' | 'landscape' | 'portrait';

/** One breakpoint's values: a length `'<n><unit>'`, `'auto'`, `'none'`, a preset `'$<step>'`, a keyword or a number. */
export type BoxStyle = Record<string, string | number | string[]>;

/** A Box's values by breakpoint. */
export type BoxStyles = Partial<Record<BoxBreakpoint, BoxStyle>>;

export interface BoxBreakpointInfo {
  id: BoxBreakpoint;
  label: string;
  /** The media query, or null for the base. */
  query: string | null;
  min?: number;
  max?: number;
  /** A width to preview it at. */
  width: number;
  optional?: boolean;
}

/** Webflow's Style panel sections. */
export type BoxSection = 'layout' | 'spacing' | 'size' | 'position';

export interface BoxPropertyInfo {
  section: BoxSection;
  /** The CSS property it writes. */
  css: string;
  /** Whether a value is allowed. */
  ok: (value: unknown) => boolean;
  /** The CSS value for a stored value, where it isn't the value itself. */
  value?: (value: never) => string;
}

export interface BoxStyleIssue {
  at: string;
  what: string;
}

export declare const BOX_BREAKPOINTS: readonly BoxBreakpointInfo[];
/** The preset steps a length field offers, in order (space tokens). */
export declare const BOX_PRESETS: readonly string[];
/** The page's own steps (LR162): `$small`, `$frame`, `$split`, `$stacked`, PageGrid's row step settings. */
export declare const BOX_PAGE_PRESETS: readonly string[];
export declare const BOX_UNITS: readonly string[];
/** Every property a Box style takes, by Style panel section, in the panel's order. */
export declare const BOX_PROPERTIES: Readonly<Record<string, BoxPropertyInfo>>;

/** The breakpoints a value at `bp` comes from, nearest last. */
export declare function boxCascade(bp: BoxBreakpoint): BoxBreakpoint[];
/** A property's value at a breakpoint and the breakpoint that sets it (Webflow's "value comes from"). */
export declare function boxValue(styles: BoxStyles | undefined, bp: BoxBreakpoint, prop: string): { value: string | number | string[] | undefined; from: BoxBreakpoint | undefined };
/** What's wrong with a Box's styles. Empty when valid. */
export declare function boxStyleProblems(styles: unknown, at?: string): BoxStyleIssue[];
/** The CSS a list of Boxes draws with, on `[data-box="<id>"]` inside `scope`; empty when no Box is styled. */
export declare function boxCss(boxes: readonly { id: string; styles?: BoxStyles; children?: readonly unknown[] }[], scope?: string): string;
