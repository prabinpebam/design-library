import { useState } from 'react';
import { Rating, type RatingProps } from '../fundamentals/Rating';
import type { StoryFile } from './story';

function Live({ initial, ...rest }: Omit<RatingProps, 'value' | 'onChange'> & { initial: number | null }) {
  const [value, setValue] = useState(initial);
  return <Rating {...rest} value={value} onChange={setValue} />;
}

const words = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export default {
  component: 'Rating',
  tier: 'fundamental',
  summary: 'Chooses or shows a score out of a few stars; hover previews, pressing the chosen value again clears it.',
  stories: [
    {
      title: 'Rate something',
      description: 'Hover previews a value in a lighter tone; a click or Space chooses it; pressing the chosen star again clears the rating. Words say what each score means.',
      code: `<Rating label="How was the review session?" words={['Poor', 'Fair', 'Good', 'Very good', 'Excellent']} value={score} onChange={setScore} />`,
      render: () => <Live label="How was the review session?" words={words} initial={null} />,
    },
    {
      title: 'Half stars',
      description: 'precision={0.5}: each star has a start half and an end half; the arrow keys move half a star.',
      code: `<Rating label="Your rating" precision={0.5} showValue value={score} onChange={setScore} />`,
      render: () => <Live label="Your rating" precision={0.5} showValue initial={3.5} />,
    },
    {
      title: 'Read-only: an average',
      description: 'Any fraction, filled to the exact share of a star, with the number written beside it and as the accessible name.',
      code: `<Rating label="Average rating" readOnly value={4.3} showValue />
<Rating label="Average rating" size="s" readOnly value={3.7} showValue />`,
      render: () => (
        <>
          <Rating label="Average rating" readOnly value={4.3} showValue />
          <Rating label="Average rating in a card" size="s" readOnly value={3.7} showValue />
        </>
      ),
    },
    {
      title: 'Sizes',
      description: 's 16 px for read-only ratings in cards and tables, normal 24 px for forms, l 32 px for a page’s main question.',
      code: `<Rating size="s" … />
<Rating … />
<Rating size="l" … />`,
      render: () => (
        <>
          <Live size="s" label="Small" initial={2} />
          <Live label="Normal" initial={3} />
          <Live size="l" label="Large" initial={4} />
        </>
      ),
    },
    {
      title: 'Ten points and unavailable',
      description: 'max sets how many stars; unavailable shows the rating and takes no input.',
      code: `<Rating label="Difficulty" max={10} showValue value={d} onChange={setD} />
<Rating label="Your rating" disabled value={4} onChange={setScore} />`,
      render: () => (
        <>
          <Live label="Difficulty" max={10} showValue initial={6} />
          <Live label="Your rating (unavailable)" disabled initial={4} />
        </>
      ),
    },
  ],
} satisfies StoryFile;
