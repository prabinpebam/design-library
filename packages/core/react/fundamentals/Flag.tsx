import { flags, type FlagCode } from '../../flags/flags';
import type { DataAttributes } from '../types';

export type { FlagCode };

export interface FlagProps extends DataAttributes {
  /** ISO 3166-1 alpha-2 code, lower case: "in", "us". Only the countries in `tools/flags.mjs` are included. */
  code: FlagCode;
}

/** The flag as an image address, for slots that take an image (a list item's thumbnail). */
export const flagSrc = (code: FlagCode) => `data:image/svg+xml;utf8,${encodeURIComponent(flags[code])}`;

/**
 * A country's flag, drawn from the subset of the MIT-licensed flag-icons set (the same picture on every system; emoji
 * flags show as letters on Windows). Decorative: the country's name or code beside it carries the meaning.
 * @tier fundamental
 * @family media
 * @a11y `aria-hidden`; never the only way a country is named.
 */
export function Flag({ code, ...data }: FlagProps) {
  return <img {...data} data-dl="flag" src={flagSrc(code)} alt="" aria-hidden="true" draggable={false} />;
}
