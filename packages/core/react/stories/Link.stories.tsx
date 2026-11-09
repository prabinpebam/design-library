import { useState } from 'react';
import { Link } from '../fundamentals/Link';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';
import { WithSettings } from './WithSettings';

const noLine = { '--link-decoration': 'none' };

const places = [
  { href: '#/colour', name: 'Colour', about: 'Brand, base and status colours, and who may use each.' },
  { href: '#/type', name: 'Typography', about: 'Faces, the type ramp and tracking.' },
  { href: '#/motion', name: 'Motion and timing', about: 'The roles every change reads, and what holds with reduced motion.' },
];

/** Point or tab to a link and the line under the list says what it holds: the pointer and focus handlers (IP9). */
function PreviewOnPoint() {
  const [shown, setShown] = useState<number | null>(null);
  return (
    <Stack gap="item">
      <Stack gap="pair">
        {places.map((p, i) => (
          <Link key={p.href} href={p.href} onPointerEnter={() => setShown(i)} onPointerLeave={() => setShown(null)} onFocus={() => setShown(i)} onBlur={() => setShown(null)}>
            {p.name}
          </Link>
        ))}
      </Stack>
      <Text variant="body-sm" tone="muted">
        {shown === null ? 'Point at a page or reach it with Tab to see what it holds.' : places[shown].about}
      </Text>
    </Stack>
  );
}

export default {
  component: 'Link',
  tier: 'fundamental',
  summary: 'Navigates to a URL or route.',
  stories: [
    {
      title: 'In running text',
      description: 'Underlined, so it never relies on colour alone.',
      arrangement: 'row',
      code: `<Text>Read the <Link href="#/colour">colour roles</Link> first.</Text>`,
      render: () => (
        <Text>
          Read the <Link href="#/colour">colour roles</Link> first.
        </Text>
      ),
    },
    {
      title: 'States',
      description: 'Current marks the page the person is on; external says it leaves this site.',
      arrangement: 'row',
      code: `<Link href="#/link" current>Link</Link>
<Link href="https://www.w3.org/WAI/ARIA/apg/" external>ARIA practices</Link>`,
      render: () => (
        <>
          <Link href="#/link" current>
            Link
          </Link>
          <Link href="https://www.w3.org/WAI/ARIA/apg/" external>
            ARIA practices
          </Link>
        </>
      ),
    },
    {
      title: 'No line at rest',
      description:
        'A brand choice, set from the theme: link.decoration none. The link then rests on its colour, which must stand 3:1 from the text around it; point at it or reach it with Tab and the line comes back, so it is never colour alone when reached. Underline stays the default.',
      arrangement: 'row',
      code: `applySettings({ '--link-decoration': 'none' });

<Text>Read the <Link href="#/colour">colour roles</Link> first.</Text>`,
      render: () => (
        <WithSettings settings={noLine}>
          <Text>
            Read the <Link href="#/colour">colour roles</Link> first.
          </Text>
        </WithSettings>
      ),
    },
    {
      title: 'Preview on point and focus',
      description:
        'onPointerEnter, onPointerLeave, onFocus and onBlur run on the link itself, so a list can preview where each one goes with no wrapper listening for events. Pair pointer with focus, so a keyboard reaches the same preview.',
      code: `<Link href="#/colour" onPointerEnter={() => show(0)} onPointerLeave={hide} onFocus={() => show(0)} onBlur={hide}>
  Colour
</Link>`,
      render: () => <PreviewOnPoint />,
    },
  ],
} satisfies StoryFile;
