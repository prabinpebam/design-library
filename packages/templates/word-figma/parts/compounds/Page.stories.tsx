import { useEffect, useRef } from 'react';
import { useRichText, type StoryFile } from '@design-library/core/components';
import { Page, fillDocument, type PageProps } from './Page';
import shared from '../../content/shared.json';
import type { WordFigmaRecord } from '../../types';

const view = shared.record as WordFigmaRecord;

/** The page with the record's document in core's rich-text surface. */
function Sample(props: Partial<PageProps>) {
  const docRef = useRef<HTMLDivElement | null>(null);
  const rich = useRichText(docRef);
  useEffect(() => {
    if (docRef.current) fillDocument(docRef.current, view.document);
  }, []);
  return <Page label={view.file} documentLabel={view.file} docRef={docRef} surface={rich.surface} zoom={1} {...props} />;
}

export default {
  component: 'word-figma.Page',
  tier: 'compound',
  summary: 'The document on a design tool canvas: the sheet, zoomed and centred, holding the rich-text surface.',
  stories: [
    { title: 'Document', description: 'The page at 100%, editable.', code: '<Page docRef={ref} surface={rich.surface} zoom={1} />', render: () => <Sample /> },
    { title: 'Zoomed out', description: 'The page at 50%.', code: '<Page docRef={ref} surface={rich.surface} zoom={0.5} />', render: () => <Sample zoom={0.5} /> },
    { title: 'Landscape, two columns', description: 'Page setup from the Page section.', code: '<Page … orientation="landscape" columns="2" />', render: () => <Sample orientation="landscape" columns="2" /> },
    { title: 'Read mode', description: 'The document can\'t be changed.', code: '<Page … readOnly />', render: () => <Sample readOnly /> },
  ],
} satisfies StoryFile;
