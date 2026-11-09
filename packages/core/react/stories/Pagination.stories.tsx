import { useState } from 'react';
import { Pagination } from '../compounds/Pagination';
import type { StoryFile } from './story';

function Results({ pages = 20, start = 5, variant }: { pages?: number; start?: number; variant?: 'numbered' | 'compact' }) {
  const [page, setPage] = useState(start);
  return <Pagination variant={variant} page={page} pages={pages} onChange={setPage} />;
}

function WithTotal() {
  const [page, setPage] = useState(2);
  const [size, setSize] = useState(20);
  const total = 312;
  const pages = Math.ceil(total / size);
  return (
    <Pagination
      page={Math.min(page, pages)}
      pages={pages}
      onChange={setPage}
      total={total}
      pageSize={size}
      pageSizes={[10, 20, 50]}
      onPageSizeChange={(next) => {
        setPage(Math.floor(((page - 1) * size) / next) + 1);
        setSize(next);
      }}
    />
  );
}

export default {
  component: 'Pagination',
  tier: 'compound',
  summary: 'Moves between the pages of a long set of results, or the previous and next pages of a guide.',
  stories: [
    {
      title: 'Numbered',
      description: 'After a list of results. The first and last pages and the ones beside the current page show; gaps stand for the rest, and a gap never hides just one page.',
      code: `<Pagination page={page} pages={20} onChange={setPage} />`,
      render: () => <Results />,
    },
    {
      title: 'Near the ends',
      description: 'On the first page, Previous keeps its place but is hidden, so the numbers don’t shift as you page.',
      code: `<Pagination page={1} pages={8} onChange={setPage} />`,
      render: () => <Results pages={8} start={1} />,
    },
    {
      title: 'Total and page size',
      description: 'Says which results are showing and lets people choose how many per page; changing the size keeps the first result shown on the page.',
      code: `<Pagination page={page} pages={pages} onChange={setPage} total={312} pageSize={size} pageSizes={[10, 20, 50]} onPageSizeChange={setSize} />`,
      render: () => <WithTotal />,
    },
    {
      title: 'Compact',
      description: 'Where numbers don’t fit or don’t help. Every pagination switches to this by itself when it is narrower than 30 rem.',
      code: `<Pagination variant="compact" page={page} pages={20} onChange={setPage} />`,
      render: () => <Results variant="compact" />,
    },
    {
      title: 'Pages with addresses',
      description: 'When each page has its own address, pages are links, so they can be opened in a new tab and shared.',
      code: `<Pagination page={3} pages={12} hrefFor={(p) => \`?page=\${p}\`} />`,
      render: () => <Pagination page={3} pages={12} hrefFor={() => '#/pagination'} />,
    },
    {
      title: 'Previous and next by name',
      description: 'For a guide split over pages: the neighbouring pages by their titles, so people know where they’re going.',
      code: `<Pagination variant="sequence" previous={{ label: 'Choosing colours', href: '/colours' }} next={{ label: 'Spacing and layout', href: '/spacing' }} />`,
      render: () => (
        <Pagination variant="sequence" previous={{ label: 'Choosing colours', href: '#/pagination' }} next={{ label: 'Spacing and layout', href: '#/pagination' }} />
      ),
    },
  ],
} satisfies StoryFile;
