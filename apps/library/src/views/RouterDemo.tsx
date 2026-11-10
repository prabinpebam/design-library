/**
 * The core router on a small site (IP27, IP30): `site.html?demo=router`. Four pages under hash routes, a header whose links
 * go through the router, in-page links to anchored sections, a page whose picture is loaded before it shows, a fade
 * between pages that a Switch turns off, and a page for an unknown address. View data only; no
 * styles. Shown on the library's Routing page in a ScreenPreview.
 */
import { useState } from 'react';
import { Cluster, Image, Link, PageHeader, SchemeControl, Section, SiteHeader, SiteLayout, Stack, Switch, TableOfContents, Text } from '@design-library/core/react';
import { loadPicture, matchPath, Router, useRoute, type Route } from '@design-library/core/site';
import hall from '../../../../packages/templates/conference/assets/main-hall.webp?url';

const pages = [
  { href: '/', label: 'Home' },
  { href: '/talks', label: 'Talks' },
  { href: '/archive/2025', label: 'Archive' },
  { href: '/venue', label: 'Venue' },
  { href: '/about', label: 'About' },
];

const years = ['2021', '2022', '2023', '2024', '2025'];
const yearTheme: Record<string, string> = {
  '2021': 'Small tools, shared well',
  '2022': 'Designing for slow networks',
  '2023': 'Words in interfaces',
  '2024': 'Maps, places and wayfinding',
  '2025': 'Repair over replace',
};

/** MP1: two pages of the archive are siblings, so moving between them keeps the place; any other link lands at the top. */
const inArchive = (r: Route) => r.path.startsWith('/archive/');
const scrollFor = (to: Route, from: Route) => (inArchive(to) && inArchive(from) ? 'keep' : 'top');

const talks = [
  { id: 'schedule', heading: 'Schedule', text: 'Doors open at nine. Talks run from half past nine until five, with lunch at one.' },
  { id: 'speakers', heading: 'Speakers', text: 'Twelve speakers from studios, schools and product teams, each with twenty minutes and five for questions.' },
  { id: 'venue', heading: 'Venue', text: 'The old print hall by the river, five minutes from the station. Step-free from the north door.' },
];

const filler = 'Each part of this page is long enough to scroll, so a link to it moves the page and Back returns to where you were.';

function View() {
  const { path } = useRoute();
  if (path === '/')
    return (
      <Stack gap="section">
        <PageHeader title="A day of talks on design" lead="Pick a page in the header, or jump straight to a part of the talks page." />
        <Cluster gap="item">
          <Link href="/talks#speakers">Meet the speakers</Link>
          <Link href="/talks#venue">Find the venue</Link>
        </Cluster>
      </Stack>
    );
  if (path === '/talks')
    return (
      <Stack gap="section">
        <PageHeader title="Talks" lead="Everything about the day, in three parts." />
        <TableOfContents layout="row" items={talks.map((t) => ({ anchor: t.id, label: t.heading }))} />
        {talks.map((t) => (
          <Section key={t.id} anchor={t.id} heading={t.heading} intro={t.text}>
            <Stack gap="item">
              {Array.from({ length: 6 }, (_, i) => (
                <Text key={i}>{filler}</Text>
              ))}
            </Stack>
          </Section>
        ))}
      </Stack>
    );
  if (matchPath('/venue', path))
    return (
      <Stack gap="section">
        <PageHeader title="The venue" lead="The old print hall by the river. The router loaded this picture before showing the page, so it arrived whole." />
        <Image src={hall} alt="The main hall just before the first talk: a lit stage with a blank screen, rows of people seated, the river and a suspension bridge through tall windows." ratio="wide" rounded />
      </Stack>
    );
  const year = matchPath('/archive/:year', path)?.year;
  if (year && years.includes(year))
    return (
      <Stack gap="section">
        <PageHeader title={`${year}: ${yearTheme[year]}`} lead="Scroll down to the line of years and pick another: the page changes and stays where it was. Any other link lands at the top." />
        <Stack gap="item">
          {Array.from({ length: 5 }, (_, i) => (
            <Text key={i}>{`The ${year} day opened with a short welcome, then talks on ${yearTheme[year].toLowerCase()}. ${filler}`}</Text>
          ))}
        </Stack>
        <Section heading="Every year" intro="Moving between years keeps your place on this line.">
          <Cluster gap="item">
            {years.map((y) => (
              <Link key={y} href={`/archive/${y}`} current={y === year}>
                {y}
              </Link>
            ))}
          </Cluster>
        </Section>
        <Stack gap="item">
          {Array.from({ length: 4 }, (_, i) => (
            <Text key={i}>{filler}</Text>
          ))}
        </Stack>
      </Stack>
    );
  if (matchPath('/about', path))
    return <PageHeader title="About" lead="A yearly day of talks, run by volunteers. The router moved focus to this page’s heading and said its name." />;
  return (
    <Stack gap="section">
      <PageHeader title="Page not found" lead={`Nothing lives at ${path}.`} />
      <Link href="/">Go to the home page</Link>
    </Stack>
  );
}

function Shell({ fade, onFade }: { fade: boolean; onFade: (next: boolean) => void }) {
  const { path } = useRoute();
  // IP32: `?header=row` keeps the bar one row in a narrow window (the Switch moves into the menu); the scheme button stays.
  const row = new URLSearchParams(window.location.search).get('header') === 'row';
  return (
    <SiteLayout
      header={
        <SiteHeader
          name="Talks on design"
          href="/"
          links={pages.map((p) => ({ ...p, current: p.href === path || (p.label === 'Archive' && path.startsWith('/archive/')) }))}
          narrow={row ? 'row' : undefined}
          tools={<SchemeControl form="button" storageKey="design-library.router-demo.scheme" />}
          actions={<Switch label="Fade between pages" checked={fade} onChange={onFade} />}
        />
      }
    >
      <View />
    </SiteLayout>
  );
}

/** The venue page needs its picture: the router holds the old page until it is decoded (at most 300 ms). */
const prepare = (to: Route) => (to.path === '/venue' ? loadPicture(hall) : undefined);

export function RouterDemo() {
  const [fade, setFade] = useState(true);
  return (
    <Router transition={fade ? 'fade' : 'none'} prepare={prepare} warm={prepare} scroll={scrollFor} again="top">
      <Shell fade={fade} onFade={setFade} />
    </Router>
  );
}
