/**
 * Fills `{name}` places in a content string with values (Q64: interface words live in content JSON, and a phrase that
 * holds a value, "Thought for {seconds} seconds", keeps its own word order). A place with no value is left empty.
 */
export const fill = (text: string, values: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
