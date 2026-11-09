import { useCallback, useState } from 'react';
import { Card } from '../compounds/Card';
import { SchemeControl, type SchemeControlProps } from '../compounds/SchemeControl';
import { Stack } from '../fundamentals/Stack';
import { Text } from '../fundamentals/Text';
import type { StoryFile } from './story';

/**
 * A preview of a page in its own scheme: the control applies to this subtree instead of the library's page, and
 * remembers the choice under the story's own key, so a reload keeps it.
 */
function Preview({ storageKey, ...rest }: Omit<SchemeControlProps, 'root'> & { storageKey: string }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  // The card itself carries the scheme, so its own corners bound the preview.
  const holder = useCallback((el: HTMLDivElement | null) => setRoot((el?.firstElementChild as HTMLElement | null) ?? null), []);
  return (
    <div ref={holder}>
      <Card title="Opening hours" description="Open every day from eight until six. The kitchen closes at half past five.">
        <Stack gap="item">
          <SchemeControl {...rest} storageKey={storageKey} root={root} />
          <Text variant="body-sm" tone="muted">
            Choose dark, then reload the page: the choice stays.
          </Text>
        </Stack>
      </Card>
    </div>
  );
}

export default {
  component: 'SchemeControl',
  tier: 'compound',
  summary: 'Chooses light, dark or the system scheme, applies it at once and remembers it.',
  stories: [
    {
      title: 'Light, dark or system',
      description: 'The default form: three answers side by side, because following the system is a choice of its own. System follows the operating system as it changes.',
      code: `<SchemeControl />`,
      render: () => <Preview storageKey="design-library.story.scheme-choice" />,
    },
    {
      title: 'Icons only',
      description: 'For a site header or title bar with little room: each icon names its scheme in a tooltip and to assistive technology.',
      code: `<SchemeControl iconOnly />`,
      render: () => <Preview storageKey="design-library.story.scheme-icons" iconOnly />,
    },
    {
      title: 'A switch in a settings list',
      description: 'Where a settings list already uses switches: one dark-mode setting, on for dark and off for light. It sets the scheme explicitly, so it never follows the system once used.',
      code: `<SchemeControl form="switch" size="normal" />`,
      render: () => <Preview storageKey="design-library.story.scheme-switch" form="switch" size="normal" />,
    },
    {
      title: 'One icon button',
      description: 'The documented option for a header with no room for the choice: one quiet button named by what it does, “Switch to dark mode”, whose icon shows the scheme it switches to.',
      code: `<SchemeControl form="button" />`,
      render: () => <Preview storageKey="design-library.story.scheme-button" form="button" />,
    },
    {
      title: 'Words from your content',
      description: 'Every word comes from props with English defaults, so a site can pass its own language.',
      code: `<SchemeControl label="Farbschema" words={{ light: 'Hell', dark: 'Dunkel', system: 'System' }} />`,
      render: () => <Preview storageKey="design-library.story.scheme-words" label="Farbschema" words={{ light: 'Hell', dark: 'Dunkel', system: 'System' }} />,
    },
  ],
} satisfies StoryFile;
