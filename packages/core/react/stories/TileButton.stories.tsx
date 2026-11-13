import { useState } from 'react';
import { Grid } from '../fundamentals/Grid';
import { Image } from '../fundamentals/Image';
import { TileButton } from '../fundamentals/TileButton';
import { scenes } from './scenes';
import type { StoryFile } from './story';

function Chooser() {
  const [chosen, setChosen] = useState(scenes[0].alt);
  return (
    <Grid max={3}>
      {scenes.slice(0, 3).map((scene) => (
        <TileButton key={scene.src} label={scene.alt} pressed={chosen === scene.alt} onClick={() => setChosen(scene.alt)}>
          <Image src={scene.src} alt="" ratio="square" />
        </TileButton>
      ))}
    </Grid>
  );
}

function Filled() {
  const [chosen, setChosen] = useState(false);
  return (
    <Grid ratio="1:2">
      <Image src={scenes[1].src} alt={scenes[1].alt} ratio="square" />
      <TileButton label={`${scenes[2].alt}, a tile two cells wide`} pressed={chosen} onClick={() => setChosen((now) => !now)}>
        <Image src={scenes[2].src} alt="" ratio="fill" />
      </TileButton>
    </Grid>
  );
}

export default {
  component: 'TileButton',
  tier: 'fundamental',
  summary: 'A bare pressable tile that fills its holder and holds what it shows (a picture, a swatch): for things chosen by their look on a grid. Its focus and chosen rings sit inside its edge.',
  stories: [
    {
      title: 'Choose by the picture',
      description: 'Three tiles, one chosen: the chosen ring is the accent, inside the edge; Tab shows the focus ring in its place. Each is named by its label, never by the picture inside.',
      code: `<TileButton label="Harbour at dusk" pressed={chosen} onClick={choose}>\n  <Image src={src} alt="" ratio="square" />\n</TileButton>`,
      render: () => <Chooser />,
    },
    {
      title: 'A tile of any shape',
      description: 'Beside a square picture the tile takes the row\'s height; its picture, Image ratio="fill", fills the shape the tile was given, cropping from its focal point.',
      code: `<TileButton label="Market street, a tile two cells wide" pressed={chosen} onClick={toggle}>\n  <Image src={src} alt="" ratio="fill" />\n</TileButton>`,
      render: () => <Filled />,
    },
  ],
} satisfies StoryFile;
