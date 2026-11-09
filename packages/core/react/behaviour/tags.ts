/** Tag input rules (TagInput, F15.15): pure, no DOM. */

export interface TagLimits {
  /** The most tags; extra ones are refused. */
  max?: number;
  /** Keep a tag that is already there (compared without case). Default false. */
  allowDuplicates?: boolean;
}

export interface TagAddResult {
  /** The tags after adding. */
  tags: string[];
  /** The tags that were added, in order. */
  added: string[];
  /** Tags refused because they were already there. */
  duplicates: string[];
  /** Tags refused because the maximum was reached. */
  overLimit: string[];
}

/** Splits typed or pasted text into tags on the separators (and line breaks), trimmed, blanks dropped. */
export function splitTags(text: string, separators: string[]): string[] {
  const chars = separators.filter((s) => s.length === 1).map((s) => s.replace(/[\\^\]-]/g, '\\$&'));
  const pattern = new RegExp(`[${chars.join('')}\\n\\r\\t]+`);
  return text
    .split(pattern)
    .map((t) => t.trim().replace(/\s+/g, ' '))
    .filter(Boolean);
}

/** Adds candidates to the tags, refusing duplicates (unless allowed) and anything past the maximum. */
export function addTags(tags: string[], candidates: string[], { max, allowDuplicates = false }: TagLimits = {}): TagAddResult {
  const next = [...tags];
  const added: string[] = [];
  const duplicates: string[] = [];
  const overLimit: string[] = [];
  for (const c of candidates) {
    if (!allowDuplicates && next.some((t) => t.toLocaleLowerCase() === c.toLocaleLowerCase())) duplicates.push(c);
    else if (max !== undefined && next.length >= max) overLimit.push(c);
    else {
      next.push(c);
      added.push(c);
    }
  }
  return { tags: next, added, duplicates, overLimit };
}
