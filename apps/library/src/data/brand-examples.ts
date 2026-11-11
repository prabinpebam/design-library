/**
 * Brand examples (owner Q135): the brands from the owner's brand-colour prompt and boards, each with a map that
 * shows one capability of the brand map. Library-only demonstrations, never core presets: the colours are
 * approximate public values (docs/brand-colour.md), and the names are used only to identify the look.
 */
import type { Preset } from './brand';

export const brandExamples: Preset[] = [
  {
    id: 'ikea',
    name: 'IKEA',
    mood: 'Blue actions with a yellow ring, switch handle and highlights: the playful two-colour button (Bold).',
    brand: { colours: { '1': { name: 'Blue', seed: '#0058A3' }, '2': { name: 'Yellow', seed: '#FFDB00' } }, accent: 1, map: { preset: 'bold' } },
  },
  {
    id: 'coca-cola',
    name: 'Coca-Cola',
    mood: 'One red on everything, with white and black as neutrals (One colour). Red sits on the danger hue.',
    brand: { colours: { '1': { name: 'Red', seed: '#F40009' } }, accent: 1, map: { preset: 'one' } },
  },
  {
    id: 'pepsi',
    name: 'Pepsi',
    mood: 'Blue everywhere; red only for highlights, about 5% of the board (Quiet).',
    brand: { colours: { '1': { name: 'Blue', seed: '#004B93' }, '2': { name: 'Red', seed: '#C9002B' } }, accent: 1, map: { preset: 'quiet' } },
  },
  {
    id: 'fila',
    name: 'FILA',
    mood: 'Navy actions with a red switch handle and highlights; the button stays navy (Signature).',
    brand: { colours: { '1': { name: 'Navy', seed: '#002D62' }, '2': { name: 'Red', seed: '#E31837' } }, accent: 1, map: { preset: 'signature' } },
  },
];
