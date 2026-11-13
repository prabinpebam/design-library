import { useState } from 'react';
import { Navigation, type NavigationGroup, type NavigationProps } from '../compounds/Navigation';
import type { StoryFile } from './story';

const tiers: NavigationGroup[] = [
  {
    id: 'tokens',
    title: 'Tokens',
    items: [
      { id: 'colour', label: 'Colour', href: '#/navigation' },
      { id: 'type', label: 'Typography', href: '#/navigation' },
      { id: 'space', label: 'Space and size', href: '#/navigation' },
    ],
  },
  {
    id: 'fundamentals',
    title: 'Fundamentals',
    items: [
      {
        id: 'buttons',
        title: 'Buttons',
        items: [
          { id: 'button', label: 'Button', href: '#/navigation' },
          { id: 'menu-button', label: 'MenuButton', href: '#/navigation' },
          { id: 'segmented-control', label: 'SegmentedControl', href: '#/navigation' },
        ],
      },
      {
        id: 'selection',
        title: 'Selection',
        items: [
          { id: 'switch', label: 'Switch', href: '#/navigation' },
          { id: 'checkbox', label: 'Checkbox', href: '#/navigation' },
        ],
      },
    ],
  },
  {
    id: 'compounds',
    title: 'Compounds',
    items: [{ id: 'navigation', label: 'Navigation', href: '#/navigation' }],
  },
];

const oneGroup: NavigationGroup[] = [
  {
    id: 'fundamentals',
    title: 'Fundamentals',
    items: [
      { id: 'button', label: 'Button', href: '#/navigation' },
      { id: 'switch', label: 'Switch', href: '#/navigation' },
      { id: 'text-field', label: 'TextField', href: '#/navigation' },
    ],
  },
];

const nested: NavigationGroup[] = [
  {
    id: 'templates',
    title: 'Templates',
    items: [
      {
        id: 'shop',
        title: 'Shop',
        items: [
          {
            id: 'shop.account',
            title: 'Account',
            items: [
              {
                id: 'shop.account.sign-in',
                title: 'Sign in',
                items: [
                  { id: 'sign-in', label: 'Sign in', href: '#/navigation' },
                  { id: 'forgot', label: 'Forgot password', href: '#/navigation' },
                ],
              },
              { id: 'shop.account.sign-up', title: 'Create an account', items: [{ id: 'sign-up', label: 'Sign up', href: '#/navigation' }] },
            ],
          },
          { id: 'shop.help', title: 'Help', items: [{ id: 'not-found', label: 'Not found', href: '#/navigation' }] },
        ],
      },
    ],
  },
];

/** The current item follows a press; every item links to this page, so the example can be tried in place. */
function Live({ initial, ...rest }: Omit<NavigationProps, 'current'> & { initial: string }) {
  const [current, setCurrent] = useState(initial);
  const [open, setOpen] = useState(false);
  return (
    <Navigation
      {...rest}
      current={current}
      open={open}
      onOpenChange={setOpen}
      onNavigate={(id) => {
        setCurrent(id);
        setOpen(false);
      }}
    />
  );
}

export default {
  component: 'Navigation',
  tier: 'compound',
  summary: 'Moves between the pages of an app: headed groups of pages and families of pages, the current page marked.',
  stories: [
    {
      title: 'One group',
      description: 'A short list under one heading. Each item is a 44 px target with a small gap to the next.',
      code: `<Navigation groups={[{ id: 'fundamentals', title: 'Fundamentals', items }]} />`,
      render: () => <Navigation groups={oneGroup} />,
    },
    {
      title: 'Current page',
      description: 'The page you’re on has the selected fill across its whole shape. Hover the item next to it: the gap keeps the two fills apart.',
      code: `<Navigation groups={groups} current={page} onNavigate={setPage} />`,
      render: () => <Live groups={oneGroup} initial="switch" />,
    },
    {
      title: 'Grouped by tier, with families',
      description: 'Each tier is a heading with the most space above it. A family’s name opens and closes its pages, which line up under its name; the current page’s family starts open. Press an item to make it current; Tab moves through items and family names in order.',
      code: `<Navigation groups={tiers} current={page} onNavigate={setPage} />`,
      render: () => <Live groups={tiers} initial="menu-button" />,
    },
    {
      title: 'Families inside families',
      description: 'A family can hold families, up to three levels: a template, its sections, their flows, then the screens. Each level indents one step so its names line up under its family’s name; every family around the current page starts open.',
      code: `<Navigation groups={templates} current={page} onNavigate={setPage} />`,
      render: () => <Live groups={nested} initial="sign-in" />,
    },
    {
      title: 'Collapsed, on narrow screens',
      description: 'One disclosure that names the page you’re on. Open it to see every page; choosing one closes it.',
      code: `<Navigation groups={tiers} current={page} collapsed open={open} onOpenChange={setOpen} onNavigate={setPage} />`,
      render: () => <Live groups={tiers} initial="button" collapsed />,
    },
    {
      title: 'Dense, in a desktop app frame',
      description: 'size s (LR41), beside AppLayout size s: 36 px rows (above the WCAG 2.2 AA 24 px minimum), a step smaller words and each group’s title a small muted label, so an editor’s many places fit a narrow column. The same parts, gaps and states; only sizes change.',
      code: `<Navigation size="s" groups={areas} current={area} onNavigate={setArea} />`,
      render: () => <Live groups={tiers} initial="colour" size="s" />,
    },
  ],
} satisfies StoryFile;
