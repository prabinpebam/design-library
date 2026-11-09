import { Hero } from '../layouts/Hero';
import { Button } from '../fundamentals/Button';
import { scenes } from './scenes';
import type { StoryFile } from './story';

const go = () => undefined;

export default {
  component: 'Hero',
  tier: 'layout',
  summary: 'A view’s opening: the title set large, a lead, the one or two main actions and, if it helps, a picture.',
  stories: [
    {
      title: 'Split',
      description: 'Words and picture side by side, the words centred on the picture; where the room is narrow, the picture goes under the words.',
      code: `<Hero level={2} title="Plan the trip together" lead="One shared plan for routes, bookings and who brings what." picture={{ src: hills, alt: 'Rolling green hills under a pale blue sky and a yellow sun.' }} actions={<><Button label="Start a plan" emphasis="primary" size="l" onClick={start} /><Button label="See an example" size="l" onClick={example} /></>} note="Free for groups of up to six." />`,
      render: () => (
        <Hero
          level={2}
          title="Plan the trip together"
          lead="One shared plan for routes, bookings and who brings what."
          picture={{ src: scenes[0].src, alt: scenes[0].alt }}
          actions={
            <>
              <Button label="Start a plan" emphasis="primary" size="l" onClick={go} />
              <Button label="See an example" size="l" onClick={go} />
            </>
          }
          note="Free for groups of up to six."
        />
      ),
    },
    {
      title: 'Stacked',
      description: 'The words, then the picture below and wide: for the opening of a long page’s section.',
      code: `<Hero level={2} layout="stacked" eyebrow="Field notes" title="The ridge at night" lead="What we saw on three nights of walking above the tree line." picture={{ src: ridge, alt: 'Dark blue hills under a night sky with a white moon.' }} />`,
      render: () => (
        <Hero
          level={2}
          layout="stacked"
          eyebrow="Field notes"
          title="The ridge at night"
          lead="What we saw on three nights of walking above the tree line."
          picture={{ src: scenes[2].src, alt: scenes[2].alt }}
        />
      ),
    },
    {
      title: 'Words only',
      description: 'No picture: the title carries the view.',
      code: `<Hero level={2} eyebrow="Journal" title="Notes" lead="Short pieces on planning, walking and the places in between." />`,
      render: () => <Hero level={2} eyebrow="Journal" title="Notes" lead="Short pieces on planning, walking and the places in between." />,
    },
    {
      title: 'Divided',
      description: 'No picture: the words in one column, the action and its note in the other, so what follows comes up close. They stack where the room is narrow.',
      code: `<Hero level={2} layout="divided" title="Everything for the weekend" lead="Routes, huts and the weather, in one place." actions={<Button label="Find a route" emphasis="primary" onClick={find} />} note="Updated every morning." />`,
      render: () => (
        <Hero
          level={2}
          layout="divided"
          title="Everything for the weekend"
          lead="Routes, huts and the weather, in one place."
          actions={<Button label="Find a route" emphasis="primary" onClick={go} />}
          note="Updated every morning."
        />
      ),
    },
  ],
} satisfies StoryFile;
