/** The Design tool template's record (Q61, Q62, Q64): what content/editor.json holds. */
import type { CanvasShape, IconName } from '@design-library/core/components';

/** One value of a layer's property: a number, words, a choice's value or on/off. */
export type PropValue = string | number | boolean;

/** One item of a property list (a fill, an effect, an export setting) or a gradient stop. */
export interface PropItem {
  [key: string]: PropValue | PropItem[];
}

/** A layer's inspector values by key (`rotation`, `fills`), beside its position and size. */
export type ShapeProps = Record<string, PropValue | PropItem[]>;

/** A layer in the document: what the canvas draws, plus its inspector values. */
export interface DesignShape extends Omit<CanvasShape, 'children' | 'look'> {
  children?: DesignShape[];
  props?: ShapeProps;
}

export interface InspectorOption {
  value: string;
  label: string;
  icon?: IconName;
}

/** Show a field or section only while another value is one of these. */
export interface InspectorWhen {
  key: string;
  is: PropValue[];
}

/**
 * One control of the inspector (Q66.3), drawn by the library component its `kind` names: number → NumberField,
 * select → Select, segmented → SegmentedControl, switch → Switch, colour → TextField with the ColourPicker swatch,
 * slider → Slider, text → TextField, alignment → AlignmentPicker, gradient → GradientEditor, align → the buttons that
 * move the layer inside its frame, column → its `fields` stacked in one cell (the spacing beside the auto-layout
 * alignment grid, as Figma), menu → an icon-only MenuButton whose name says the current choice. `key` is the property it reads and writes (`x`, `y`, `width`, `height` and
 * `text` are the layer's own; the rest are its props); a number's `also` keys are written with it (one horizontal
 * padding sets left and right), and it reads Mixed when they differ. `when` may list several conditions; all must hold.
 */
export interface InspectorField {
  key: string;
  kind: 'number' | 'select' | 'segmented' | 'switch' | 'colour' | 'slider' | 'text' | 'alignment' | 'gradient' | 'align' | 'column' | 'menu';
  label: string;
  glyph?: string;
  icon?: IconName;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: InspectorOption[];
  iconOnly?: boolean;
  when?: InspectorWhen | InspectorWhen[];
  /** More keys a number writes with `key`. */
  also?: string[];
  /** A column's fields, stacked. */
  fields?: InspectorField[];
  /** `action`: drawn in the row's action column, after the fields (a stroke's sides menu). */
  at?: 'action';
  /** Takes two thirds of a two-field row (a stroke's position beside its weight). */
  wide?: boolean;
  /** A text field's hint while empty (an export's "Suffix"). */
  placeholder?: string;
}

/** A list of like items in one section: fills, strokes, effects, layout grids, exports, interactions. */
export interface InspectorList {
  key: string;
  /** The add button's name: "Add fill". */
  add: string;
  /** One item's name; {n} is its number: "Fill {n}". */
  item: string;
  remove: string;
  /** The key of each item's on/off visibility, shown as a Switch named "Show". */
  visible?: string;
  show?: string;
  rows: InspectorField[][];
  /** Each item as one row naming it, e.g. "{trigger} → {destination}" (each key filled with its chosen option's label); its button opens the fields, labelled, in a Popover (Figma's interactions). */
  summary?: string;
  /** A new item's values. */
  template: PropItem;
}

/** A computed reading in the Dev tab: a label and the property it shows. */
export interface InspectorFact {
  label: string;
  key: string;
  unit?: string;
}

/** One group of the inspector, a PropertySection. */
export interface InspectorSection {
  id: string;
  heading: string;
  /** Layer kinds it applies to; all when absent. */
  kinds?: ('frame' | 'rectangle' | 'ellipse' | 'text')[];
  when?: InspectorWhen;
  rows?: InspectorField[][];
  list?: InspectorList;
  /** The list's items come before the rows (Stroke: its paints, then weight and position, as Figma). */
  listFirst?: boolean;
  /** Dev tab: readings of the layer's values. */
  facts?: InspectorFact[];
  /** Dev tab: the layer's CSS, generated from its values, under this label. */
  code?: string;
  /** Dev tab: every colour the layer and its children use. */
  colours?: boolean;
  /** An action under the rows (Export): its label, and what the example says when pressed. */
  action?: { label: string; says: string };
}

export interface InspectorTab {
  id: string;
  label: string;
  sections: InspectorSection[];
}

export interface DesignTool {
  value: string;
  label: string;
  icon: IconName;
}

export interface DesignAppSpec {
  file: string;
  project: string;
  pages: { id: string; label: string }[];
  page: string;
  people: { name: string; presence?: 'available' | 'away' }[];
  tools: DesignTool[];
  zooms: number[];
  /** The page's size in document units, so the canvas scrolls to every frame. */
  width: number;
  height: number;
  shapes: DesignShape[];
  /** Every layer's starting values, by kind (`all` first, then the kind's own); a layer's `props` override them. */
  defaults: Record<'all' | 'frame' | 'rectangle' | 'ellipse' | 'text', ShapeProps>;
  /** The inspector's tabs (Design, Prototype, Dev), their sections and controls (Q66.3). */
  inspector: InspectorTab[];
  /** Selected when the editor opens. */
  selected?: string;
  /** Fill names for the category colours 1–8, as the fill field offers them. */
  fills: string[];
  /** Present mode: the prototype played full size, frame by frame (Q66, F15.T6). */
  present: DesignPresentSpec;
  /** Comment mode: threads pinned to layers, in the properties panel (Q66, F15.T6). */
  comments: DesignCommentsSpec;
  /** Every interface word the screens show. */
  strings: DesignStrings;
}

/** Present mode's frames and words. `{name}` marks a value filled in. */
export interface DesignPresentSpec {
  /** The frames in the order Previous and Next move through them; the first is the flow's starting point. */
  frames: string[];
  strings: {
    /** The panel of frames. */
    frames: string;
    /** The panel listing what can be pressed in this frame. */
    hotspots: string;
    back: string;
    previous: string;
    next: string;
    restart: string;
    /** "{frame}, {n} of {count}". */
    position: string;
    /** The stage's name: "{frame}, presented". */
    stage: string;
    /** A hotspot's description in the list: "Goes to {frame}". */
    goesTo: string;
    noHotspots: string;
    /** Said when a part with no interaction is pressed. */
    nothingHere: string;
  };
}

/** One comment: who, when and what. */
export interface DesignComment {
  author: string;
  time: string;
  text: string;
}

/** A comment thread pinned to a layer. */
export interface DesignThread extends DesignComment {
  id: string;
  /** The layer it's pinned to. */
  layer: string;
  replies: DesignComment[];
  resolved?: boolean;
}

/** Comment mode's threads and words. */
export interface DesignCommentsSpec {
  /** Who is writing replies in the example. */
  me: string;
  threads: DesignThread[];
  strings: {
    heading: string;
    showResolved: string;
    /** "On {layer}". */
    onLayer: string;
    reply: string;
    replyLabel: string;
    /** A new reply's time: "Just now". */
    now: string;
    resolve: string;
    reopen: string;
    /** Said when a thread is resolved: "Resolved: {layer}". */
    resolved: string;
    /** No open threads on the page. */
    none: string;
  };
}


/** Interface words (Q64: every word a person reads is content). `{name}` marks a value filled in. */
export interface DesignStrings {
  kindFrame: string;
  kindRectangle: string;
  kindEllipse: string;
  kindText: string;
  tool: string;
  zoom: string;
  zoomValue: string;
  zoomTo: string;
  working: string;
  share: string;
  /** The properties panel's view options (a Popover): "View options". */
  viewOptions: string;
  /** The Switch that shows every field's label above it: "Property labels". */
  propertyLabels: string;
  /** A layer row's visibility Switch; {name} is the layer: "Show {name}". */
  showLayer: string;
  /** A layer row's lock Switch: "Lock {name}". */
  lockLayer: string;
  notInExample: string;
  sharing: string;
  pages: string;
  layers: string;
  position: string;
  xPosition: string;
  yPosition: string;
  size: string;
  width: string;
  height: string;
  fill: string;
  surface: string;
  text: string;
  empty: string;
  inspector: string;
  noColours: string;
  canvas: string;
}
