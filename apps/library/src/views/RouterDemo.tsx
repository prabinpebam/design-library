/**
 * The core router on a small site (IP27): `site.html?demo=router`. Three pages under hash routes, a header whose links
 * go through the router, in-page links to anchored sections, and a page for an unknown address. View data only; no
 * styles. Shown on the library's Routing page in a ScreenPreview.
 */
import { Cluster, Link, PageHeader, Section, SiteHeader, SiteLayout, Stack, TableOfContents, Text } from '@design-library/core/react';
import { matchPath, Router, useRoute } from '@design-library/core/site';

const pages = [
  { href: '/', label: 'Home' },
  { href: '/talks', label: 'Talks' },
  { href: '/about', label: 'About' },
];

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
  if (matchPath('/about', path))
    return <PageHeader title="About" lead="A yearly day of talks, run by volunteers. The router moved focus to this page’s heading and said its name." />;
  return (
    <Stack gap="section">
      <PageHeader title="Page not found" lead={`Nothing lives at ${path}.`} />
      <Link href="/">Go to the home page</Link>
    </Stack>
  );
}

function Shell() {
  const { path } = useRoute();
  return (
    <SiteLayout header={<SiteHeader name="Talks on design" href="/" links={pages.map((p) => ({ ...p, current: p.href === path }))} />}>
      <View />
    </SiteLayout>
  );
}

export function RouterDemo() {
  return (
    <Router>
      <Shell />
    </Router>
  );
}
