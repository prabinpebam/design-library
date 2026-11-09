import { Image } from '../fundamentals/Image';
import { Grid } from '../fundamentals/Grid';
import { scenes } from './scenes';
import type { StoryFile } from './story';

export default {
  component: 'Image',
  tier: 'fundamental',
  summary: 'A picture in a frame of a fixed shape that holds its space while it loads and says what it was when it can’t load.',
  stories: [
    {
      title: 'A picture',
      description: 'In a 3:2 frame, rounded, loaded when it nears the window. The frame keeps its space, so the words under it never jump.',
      code: `<Image src={hills} alt="Rolling green hills under a pale blue sky and a yellow sun." />`,
      render: () => <Image src={scenes[0].src} alt={scenes[0].alt} />,
    },
    {
      title: 'Frame shapes',
      description: 'Wide 16:9, photo 3:2, square and portrait 4:5. The picture fills the frame and its edges are cropped.',
      code: `<Image ratio="wide" … />  <Image ratio="photo" … />  <Image ratio="square" … />  <Image ratio="portrait" … />`,
      render: () => (
        <Grid max={4}>
          <Image ratio="wide" src={scenes[1].src} alt={scenes[1].alt} />
          <Image ratio="photo" src={scenes[2].src} alt={scenes[2].alt} />
          <Image ratio="square" src={scenes[3].src} alt={scenes[3].alt} />
          <Image ratio="portrait" src={scenes[4].src} alt={scenes[4].alt} />
        </Grid>
      ),
    },
    {
      title: 'Wider and squarer frames',
      description: 'Ultrawide 21:9 for a band across a page, classic 4:3 for a calmer photo. Same picture, so the crop shows.',
      code: `<Image ratio="ultrawide" … />  <Image ratio="classic" … />`,
      render: () => (
        <Grid max={2}>
          <Image ratio="ultrawide" src={scenes[1].src} alt={scenes[1].alt} />
          <Image ratio="classic" src={scenes[1].src} alt={scenes[1].alt} />
        </Grid>
      ),
    },
    {
      title: 'Focal point',
      description: 'When cover crops, focalPoint keeps a point in view: x and y in percent from the start and top edges. The same tall crop of one picture, centred (default), held on its left part, then on its right part.',
      code: `<Image ratio="portrait" focalPoint={{ x: 10, y: 50 }} … />`,
      render: () => (
        <Grid max={3}>
          <Image ratio="portrait" src={scenes[1].src} alt={scenes[1].alt} />
          <Image ratio="portrait" focalPoint={{ x: 10, y: 50 }} src={scenes[1].src} alt={scenes[1].alt} />
          <Image ratio="portrait" focalPoint={{ x: 90, y: 50 }} src={scenes[1].src} alt={scenes[1].alt} />
        </Grid>
      ),
    },
    {
      title: 'Shown whole',
      description: 'With fit set to contain, the whole picture shows inside the frame, on the frame’s soft fill.',
      code: `<Image ratio="square" fit="contain" src={…} alt="…" />`,
      render: () => (
        <Grid max={2}>
          <Image ratio="square" fit="contain" src={scenes[5].src} alt={scenes[5].alt} />
          <Image ratio="square" src={scenes[5].src} alt={scenes[5].alt} />
        </Grid>
      ),
    },
    {
      title: 'With a caption and a credit',
      description: 'A caption makes it a figure: the caption is read with the picture.',
      code: `<Image src={…} alt="…" caption="Harvest time in the valley." credit="Generated for this library" />`,
      render: () => <Image src={scenes[6].src} alt={scenes[6].alt} caption={scenes[6].caption} credit="Generated for this library" />,
    },
    {
      title: 'Failed to load',
      description: 'A picture that can’t load shows an icon and its alternative text, so nothing goes missing without a word. While a picture is on its way, its frame shimmers instead (seen on a slow connection). The shimmer runs three passes, then holds still.',
      code: `<Image src="/missing.jpg" alt="The team at the spring offsite." />`,
      render: () => (
        <Grid max={2}>
          <Image src="/no-such-picture.jpg" alt="The team at the spring offsite, on the steps of the old library." />
          <Image src="/no-such-picture-either.jpg" alt="" />
        </Grid>
      ),
    },
    {
      title: 'Square corners',
      description: 'For a picture that meets the edge of its container, such as the top of a card.',
      code: `<Image rounded={false} ratio="wide" src={…} alt="…" />`,
      render: () => <Image rounded={false} ratio="wide" src={scenes[3].src} alt={scenes[3].alt} />,
    },
  ],
} satisfies StoryFile;
