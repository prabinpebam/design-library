import { useState } from 'react';
import { moveCard } from '../behaviour/board';
import { Board, type BoardColumn } from '../compounds/Board';
import type { StoryFile } from './story';

const sprint: BoardColumn[] = [
  {
    id: 'todo',
    title: 'To do',
    cards: [
      { id: 'kw-151', reference: 'KW-151', title: 'Remember the last trip filter', tags: [{ label: 'Story' }], assignee: 'Jonas Lind', meta: '3 pts' },
      { id: 'kw-148', reference: 'KW-148', title: 'Sign-in error is read twice', tags: [{ label: 'Bug', tone: 'danger' }], meta: '1 pt' },
    ],
  },
  {
    id: 'doing',
    title: 'In progress',
    limit: 3,
    cards: [
      { id: 'kw-142', reference: 'KW-142', title: 'Trip cards on the home screen', tags: [{ label: 'Story' }], assignee: 'Ama Mensah', meta: '5 pts' },
      { id: 'kw-139', reference: 'KW-139', title: 'Dark theme for settings', tags: [{ label: 'Task' }], assignee: 'Keiko Arai', meta: '2 pts' },
    ],
  },
  { id: 'review', title: 'In review', cards: [] },
  {
    id: 'done',
    title: 'Done',
    cards: [{ id: 'kw-131', reference: 'KW-131', title: 'Password field shows its rules', tags: [{ label: 'Story' }], assignee: 'Luis Ortega', meta: '3 pts' }],
  },
];

function Demo({ start }: { start: BoardColumn[] }) {
  const [columns, setColumns] = useState(start);
  return <Board label="Sprint 14 board" columns={columns} onMove={(card, to, index) => setColumns((c) => moveCard(c, card, to, index))} />;
}

export default {
  component: 'Board',
  tier: 'compound',
  summary: 'Work as cards in columns by stage: drag a card to another column or position, or move it with its Move menu.',
  stories: [
    {
      title: 'A sprint board',
      description: 'Drag a card to another column; the column it’s over shows the accent outline only while you drag. Or use a card’s Move menu, which is how the keyboard moves it. In progress has a limit, so its count says “2 of 3”; an empty column says so. While you drag, room opens where the card would land and the cards after it slide down; on drop the column it left closes up. A card moved with its menu travels across the board to its new column. Reduced motion: nothing slides.',
      code: `const [columns, setColumns] = useState(sprint);
<Board
  label="Sprint 14 board"
  columns={columns}
  onMove={(card, to, index) => setColumns((c) => moveCard(c, card, to, index))}
/>`,
      render: () => <Demo start={sprint} />,
    },
    {
      title: 'A pipeline',
      description: 'Any stages and any cards: here, applications for a job, with no references or tags.',
      code: `<Board label="Applications" columns={[{ id: 'new', title: 'New', cards: [{ id: 'a', title: 'Ines Duarte', meta: '2 days ago' }] }, …]} />`,
      render: () => (
        <Demo
          start={[
            { id: 'new', title: 'New', cards: [{ id: 'a', title: 'Ines Duarte', meta: '2 days ago' }, { id: 'b', title: 'Tom Becker', meta: 'Today' }] },
            { id: 'talk', title: 'First talk', cards: [{ id: 'c', title: 'Priya Raman', meta: 'Thursday' }] },
            { id: 'offer', title: 'Offer', cards: [] },
          ]}
        />
      ),
    },
  ],
} satisfies StoryFile;
