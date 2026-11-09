/**
 * The token categories presets work on (Q70), registered with core's preset store: colour (the brand), type (faces and
 * axes), icons (library and style), space, shape and material (frosted or solid, Q73). Each wraps the store that already owns that category, so the
 * library's own switches and editors and the presets are one model, not two. Importing this module applies every
 * stored choice and follows changes made in other tabs, windows and preview frames.
 */
import { fontPresets } from '@design-library/core/fonts';
import { getIconChoice, iconSets, subscribeIconChoice, type IconChoice } from '@design-library/core/icons';
import { registerPresetCategory, type CategoryPreset } from '@design-library/core/presets';
import { getBrand, presets as colourPresets, setBrand, subscribeBrand, themeBrand, type Brand } from './brand';
import { chooseIcons } from './icons';
import { getSpaceShape, setShape, setSpace, subscribeSpaceShape } from './space-shape';
import { shapeOptions, spaceOptions, themeSpaceShape, type ShapeOption, type SpaceOption } from './tokens';
import { getMaterial, setMaterial, subscribeMaterial, themeMaterial, type MaterialFinish } from './material';
import { getType, setType, subscribeType, themePreset, type TypeChoice } from './type';

const builtIn = <V>(category: string, list: Omit<CategoryPreset<V>, 'category' | 'builtIn'>[]): CategoryPreset<V>[] =>
  list.map((p) => ({ ...p, category, builtIn: true }));

registerPresetCategory<Brand>({
  id: 'colour',
  label: 'Colour',
  builtIns: builtIn('colour', [
    { id: 'theme', name: 'Theme colours', for: 'The colours colour.config.json declares', theme: true, value: themeBrand },
    ...colourPresets.map((p) => ({ id: p.id, name: p.name, for: p.mood, value: p.brand })),
  ]),
  get: getBrand,
  set: (v) => setBrand(v),
  subscribe: subscribeBrand,
});

registerPresetCategory<TypeChoice>({
  id: 'type',
  label: 'Type',
  builtIns: builtIn(
    'type',
    [...fontPresets]
      .sort((a, b) => Number(!!b.default) - Number(!!a.default))
      .map((p) => ({ id: p.id, name: p.name, theme: p.id === themePreset.id, value: { roles: { ...p.roles }, axes: { ...(p.axes ?? {}) } } })),
  ),
  get: getType,
  set: setType,
  subscribe: subscribeType,
});

registerPresetCategory<IconChoice>({
  id: 'icons',
  label: 'Icons',
  builtIns: builtIn<IconChoice>('icons', [
    { id: 'theme', name: 'Library outline', for: 'The library’s own drawn set', theme: true, value: { set: null, style: null } },
    ...iconSets.map((s) => ({ id: s.id, name: s.name, value: { set: s.id, style: s.styles[0].id } })),
  ]),
  get: getIconChoice,
  set: (v) => chooseIcons(v.set, v.style),
  subscribe: subscribeIconChoice,
});

registerPresetCategory<SpaceOption>({
  id: 'space',
  label: 'Space',
  builtIns: builtIn(
    'space',
    spaceOptions.map((o) => ({ id: o.id, name: o.label, for: o.for, theme: o.id === themeSpaceShape.space, value: o.id })),
  ),
  get: () => getSpaceShape().space,
  set: setSpace,
  subscribe: subscribeSpaceShape,
});

registerPresetCategory<ShapeOption>({
  id: 'shape',
  label: 'Shape',
  builtIns: builtIn(
    'shape',
    shapeOptions.map((o) => ({ id: o.id, name: o.label, for: o.for, theme: o.id === themeSpaceShape.shape, value: o.id })),
  ),
  get: () => getSpaceShape().shape,
  set: setShape,
  subscribe: subscribeSpaceShape,
});

registerPresetCategory<MaterialFinish>({
  id: 'material',
  label: 'Material',
  builtIns: builtIn<MaterialFinish>('material', [
    { id: 'frosted', name: 'Frosted', for: 'Bars and floating surfaces show a blur of what is behind them', theme: themeMaterial === 'frosted', value: 'frosted' },
    { id: 'solid', name: 'Solid', for: 'Every surface opaque', theme: themeMaterial === 'solid', value: 'solid' },
  ]),
  get: getMaterial,
  set: setMaterial,
  subscribe: subscribeMaterial,
});
