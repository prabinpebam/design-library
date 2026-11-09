/** Pass-through `data-*` attributes: the only extra attributes a sealed fundamental accepts (no class or style). */
export type DataAttributes = { [key: `data-${string}`]: string | undefined };
