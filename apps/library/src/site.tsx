/**
 * Templates as standalone sites (Q63): `site.html#/app/{template}/{layout}` renders one layout of a template on its
 * own, in its own tab, with no library chrome. Links inside a template move between its layouts as on a real site.
 * Each template remembers its own light or dark and contrast (in this browser, per template); a FloatingBar holds
 * the switches. A screen with states (Q65 TP2–TP3: a form's error and outcome, a list's empty state) also gets a
 * "Screen state" switch there: changing it keeps the page where it is, so the state morphs in its own box. The same
 * view data and screens as the library's Templates pages; no styles.
 */
import { StrictMode, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@design-library/core/css/index.css';
// Q70: the library's global token choices (colour, type, icons, space, shape) apply here too and follow live.
import './data/presets';
import { FloatingBar, Notifications, SegmentedControl, suspendMotion, Text } from '@design-library/core/react';
import { applyBrand, applyFonts, applySettings, type BaseColours } from '@design-library/core/theme';
import siteFaceUrl from '@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url';
import { themeBrand } from './data/brand';
import { AppearanceContext, type Contrast, type Scheme } from './data/contexts';
import { layoutOf, statesOf } from './data/templates';
import { layoutScreens } from './views/templates';
import { PresetSettings } from './inspectors/presets';
import { RouterDemo } from './views/RouterDemo';

const routeOf = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, '')).replace(/^app\//, '');

/**
 * Frame settings shown on SiteLayout's library page (IP4): `site.html?frame=flush#/app/…` draws a template's screen
 * with theme settings applied, through the same `applySettings` a project calls.
 */
const FRAMES: Record<string, Record<string, string>> = {
  flush: { '--c-site-layout-padding-start': '0px' },
  tight: { '--c-site-layout-gap': 'var(--space-stack-section)', '--c-site-layout-padding-block': 'var(--space-stack-section)', '--c-site-layout-width': '60rem' },
};
const frame = new URLSearchParams(window.location.search).get('frame');
if (frame && FRAMES[frame]) applySettings(FRAMES[frame]);

/** A brand's own base on the Colour page (IP6): `site.html?base=paper#/app/…` draws a screen on a warm paper canvas. */
const BASES: Record<string, BaseColours> = {
  paper: { temperature: 'warm', pins: { '25': '#f7f4ef', '900': '#1b1916', '950': '#121110' } },
};
const base = new URLSearchParams(window.location.search).get('base');
if (base && BASES[base]) applyBrand({ ...themeBrand, base: BASES[base] });
/**
 * The contrast guard on the Colour page (IP21): `site.html?seed=%23ffd400&pin=1&guard=1#/app/…` draws a screen with a
 * bright accent (pinned at step 500 with `pin`), with or without `contrast: 'guard'`.
 */
const query = new URLSearchParams(window.location.search);
/**
 * A site-supplied face on the Typography page (IP23): `site.html?face=site#/app/…` sets the display role to a face the
 * site serves itself (an open-licence file, registered under the site's own family name), with a metric-matched fallback.
 */
if (query.get('face') === 'site')
  void applyFonts({
    roles: { display: 'site-display' },
    faces: [
      {
        id: 'site-display',
        family: 'Site Grotesk',
        classification: 'sans',
        sources: [{ url: siteFaceUrl, format: 'woff2', weight: '300 700' }],
        fallback: { local: 'Arial', sizeAdjust: '102%', ascentOverride: '96%', descentOverride: '28%', lineGapOverride: '0%' },
      },
    ],
  });
/** The optional label and numeral roles (IP24): `site.html?face=roles#/app/…` sets eyebrows in a monospace and figures in a grotesque. */
if (query.get('face') === 'roles') void applyFonts({ roles: { label: 'jetbrains-mono', numeral: 'space-grotesk' } });
const seed = query.get('seed');
if (seed && /^#[0-9a-f]{6}$/i.test(seed))
  applyBrand({ colours: { 1: { seed, ...(query.get('pin') ? { pins: { '500': seed } } : {}) } }, contrast: query.get('guard') ? 'guard' : 'keep' });
/** The screen a route shows: a state's route names its screen's. */
const screenOf = (route: string) => {
  const shown = layoutOf(route);
  return shown ? `${shown.template.id}/${shown.layout.stateOf ?? shown.layout.id}` : route;
};

function useRemembered<T extends string>(key: string, system: () => T) {
  const [value, setValue] = useState<T>(() => (localStorage.getItem(key) as T | null) ?? system());
  useEffect(() => setValue((localStorage.getItem(key) as T | null) ?? system()), [key]);
  const set = (next: T) => {
    localStorage.setItem(key, next);
    setValue(next);
  };
  return [value, set] as const;
}

function TemplateSite() {
  const [route, setRoute] = useState(routeOf);
  useEffect(() => {
    let last = routeOf();
    const onHash = () => {
      const next = routeOf();
      // Another state of the same screen stays where it is, so the change is seen in place.
      if (screenOf(next) !== screenOf(last)) window.scrollTo(0, 0);
      last = next;
      setRoute(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const template = route.split('/')[0] || 'corporate';
  const [scheme, setScheme] = useRemembered<Scheme>(`template-site.${template}.scheme`, () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  const [contrast, setContrast] = useRemembered<Contrast>(`template-site.${template}.contrast`, () => (matchMedia('(prefers-contrast: more)').matches ? 'more' : 'standard'));
  // A theme or contrast change lands in one frame, with no colour fades (M10, as the library's title bar). The screen
  // state switch is left animated on purpose: showing a state's morph is what it's for.
  useLayoutEffect(() => {
    suspendMotion(() => (document.documentElement.dataset.scheme = scheme));
  }, [scheme]);
  // On body, not the root: the system's more-contrast rule sits on :root, and a person's own choice must win over it.
  useLayoutEffect(() => {
    suspendMotion(() => (document.body.dataset.contrast = contrast));
  }, [contrast]);

  const shown = layoutOf(route);
  const screen = layoutScreens[route];
  useEffect(() => {
    document.title = shown ? `${shown.layout.title} · ${shown.template.title}` : 'Template not found';
  }, [shown]);
  const appearance = useMemo(() => ({ scheme, contrast }), [scheme, contrast]);
  const screenId = shown ? (shown.layout.stateOf ?? shown.layout.id) : '';
  const states = shown ? statesOf(shown.template, screenId).filter((l) => !l.planned) : [];
  const screenTitle = shown?.template.layouts.find((l) => l.id === screenId)?.title ?? '';

  return (
    <AppearanceContext.Provider value={appearance}>
      {screen ? screen() : <Text as="p">There’s no template layout called “{route}”. Open a template from the library’s Templates section.</Text>}
      <FloatingBar label="Preview">
        {shown && states.length > 0 && (
          <SegmentedControl
            label="Screen state"
            size="s"
            value={shown.layout.id}
            onChange={(v) => (window.location.hash = `#/app/${shown.template.id}/${v}`)}
            options={[{ value: screenId, label: screenTitle }, ...states.map((l) => ({ value: l.id, label: l.title }))]}
          />
        )}
        <SegmentedControl label="Colour scheme" iconOnly size="s" value={scheme} onChange={(v) => setScheme(v as Scheme)} options={[{ value: 'light', label: 'Light', icon: 'scheme-light' }, { value: 'dark', label: 'Dark', icon: 'scheme-dark' }]} />
        <SegmentedControl label="Contrast" iconOnly size="s" value={contrast} onChange={(v) => setContrast(v as Contrast)} options={[{ value: 'standard', label: 'Standard contrast', icon: 'contrast-standard' }, { value: 'more', label: 'More contrast', icon: 'contrast-more' }]} />
        <PresetSettings />
      </FloatingBar>
      <Notifications />
    </AppearanceContext.Provider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* The core router on a small site (IP27): `site.html?demo=router`, shown on the Routing page. */}
    {query.get('demo') === 'router' ? <RouterDemo /> : <TemplateSite />}
  </StrictMode>,
);
