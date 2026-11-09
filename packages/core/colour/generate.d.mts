/**
 * One tonal ramp. Pinned steps keep their hand-set value; the seed becomes its nearest step; every other step takes the
 * tone curve bent through those control points (lightness), with chroma and hue interpolated between them.
 * @param {{ steps: string[], seed?: string, pins?: Record<string, string>, base?: { h: number, c: number }, tone?: Record<string, number>, label: string }} spec
 * @param {string[]} errors
 */
export function ramp({ steps, seed, pins, base, tone, label }: {
    steps: string[];
    seed?: string;
    pins?: Record<string, string>;
    base?: {
        h: number;
        c: number;
    };
    tone?: Record<string, number>;
    label: string;
}, errors: string[]): Record<string, string>;
/** Validates a config and generates its token tree. Returns { tree, pairs, errors }. */
export function generate(config: any): {
    tree: null;
    pairs: never[];
    errors: string[];
} | {
    tree: {
        $comment: string;
        p: any;
        color: {
            ai?: any;
            category?: any;
            brand: any;
        };
        spectrum: any;
        set: any;
    };
    pairs: {
        fg: string;
        bg: string;
        min: number;
    }[];
    errors: string[];
};
export const CONTRACT: "colour-config/2";
/** Target OKLCH lightness of each step: one tone curve for every ramp, so a step is about as light in every hue. */
export const TONE: Record<string, number>;
export const BASE_STEPS: string[];
export const HUE_STEPS: string[];
/** The four brand colour slots. They're numbered, not ranked (owner, F7d): any defined slot can be the accent. */
export const BRAND_SLOTS: readonly ["1", "2", "3", "4"];
export const HEX: RegExp;
export function nearestHueName(h: number): string;
export function hueName(h: number): string;
export function brandSlots(config: any): [string, {
    name?: string;
    seed: string;
    pins?: Record<string, string>;
}][];
export function slotName(slot: string, c: {
    name?: string;
} | undefined): string;
