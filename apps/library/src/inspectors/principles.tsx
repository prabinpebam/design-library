/** Q78.2/Q79: the frameworks behind a page, in short plain points, each linking to its full framework. */
import { Grid, Heading, Link, List, Stack, Text } from '@design-library/core/react';
import { docsHref } from '../data/site-links';
import principles from '../../../../packages/core/principles/principles.json';

export function Principles({ ids }: { ids: string[] }) {
  const shown = principles.frameworks.filter((f) => ids.includes(f.id));
  return (
    <Grid max={2}>
      {shown.map((f) => (
        <Stack key={f.id} gap="group">
          <Heading level={3} size={4}>
            {f.title}
          </Heading>
          <List items={f.points.map((text, i) => ({ id: String(i), content: <Text>{text}</Text> }))} />
          <Link href={docsHref(f.doc.path)} newTab>
            {`Read the full framework: ${f.doc.label}`}
          </Link>
        </Stack>
      ))}
    </Grid>
  );
}
