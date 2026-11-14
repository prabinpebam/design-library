/** Pass-through `data-*` attributes: the only extra attributes a sealed fundamental accepts (no class or style). */
export type DataAttributes = { [key: `data-${string}`]: string | undefined };

/**
 * Matches the root of any library component (LR145): for tools that find "the component under the pointer" (a comment
 * or review picker, an inspector), so they never write the library's attribute themselves. A selector to query with,
 * never to style with.
 */
export const COMPONENT_ROOT = '[data-dl]';
