import { MediaPlayer } from '../compounds/MediaPlayer';
import { scenes } from './scenes';
import driftWebm from './media/drift.webm?url';
import driftMp4 from './media/drift.mp4?url';
import driftPoster from './media/drift-poster.jpg?url';
import driftCaptions from './media/drift.en.vtt?url';
import humWebm from './media/hum.webm?url';
import humMp3 from './media/hum.mp3?url';
import type { StoryFile } from './story';

// The sample video and audio were generated for these examples (a colour gradient and a synthesised chord): no
// third-party media. The embeds below load a public sample from its provider only when Play is pressed.
const lagoon = scenes[3];

export default {
  component: 'MediaPlayer',
  tier: 'compound',
  summary: 'Plays a video or a piece of audio, with its caption: a file, or a YouTube or Vimeo video behind a poster.',
  stories: [
    {
      title: 'A video file',
      description: 'A file this product serves plays in the browser’s own player, from the first of its encodings the browser can play (WebM, then MP4), with its captions file so captions can be turned on. It takes its shape before it loads, and nothing plays by itself.',
      code: `<MediaPlayer source={{ from: 'file', files: [{ src: driftWebm, type: 'video/webm' }, { src: driftMp4, type: 'video/mp4' }], tracks: [{ src: captions, label: 'English', lang: 'en' }] }} title="Colour drift" poster={poster} caption="Twelve seconds of night blue drifting into evening orange, over a low chord." />`,
      render: () => (
        <MediaPlayer
          source={{ from: 'file', files: [{ src: driftWebm, type: 'video/webm' }, { src: driftMp4, type: 'video/mp4' }], tracks: [{ src: driftCaptions, label: 'English', lang: 'en' }] }}
          title="Colour drift"
          poster={driftPoster}
          caption="Twelve seconds of night blue drifting into evening orange, over a low chord."
        />
      ),
    },
    {
      title: 'A YouTube video behind its poster',
      description: 'Only the poster loads at first, with one large play button and the length on its corner, so the page stays fast and nothing reaches YouTube until the person asks. Play loads the remote player (YouTube’s privacy-enhanced mode), starts it and moves focus into it.',
      code: `<MediaPlayer source={{ from: 'youtube', id: 'aqz-KE-bpKQ' }} title="Big Buck Bunny" poster={poster} posterAlt="…" duration={635} caption="An open movie from the Blender Foundation." />`,
      render: () => (
        <MediaPlayer source={{ from: 'youtube', id: 'aqz-KE-bpKQ' }} title="Big Buck Bunny" poster={lagoon.src} posterAlt={lagoon.alt} duration={635} caption="An open movie from the Blender Foundation." />
      ),
    },
    {
      title: 'A poster in grey until pointed at',
      description: 'posterTreatment takes the same treatment as Image: here the poster is grey at rest and turns to colour while the player is pointed at or its play button has focus. Without it the poster is drawn as it is.',
      code: `<MediaPlayer source={{ from: 'youtube', id: '…' }} title="Big Buck Bunny" poster={poster} posterTreatment={{ rest: 'greyscale', active: 'none' }} duration={635} />`,
      render: () => (
        <MediaPlayer source={{ from: 'youtube', id: 'aqz-KE-bpKQ' }} title="Big Buck Bunny" poster={lagoon.src} posterAlt={lagoon.alt} posterTreatment={{ rest: 'greyscale', active: 'none' }} duration={635} caption="An open movie from the Blender Foundation." />
      ),
    },
    {
      title: 'At its own shape',
      description: 'Given the video’s own width and height, the player takes exactly that shape: a wide loop stays wide. A tall one (a phone video) never grows taller than the window: it narrows and centres instead.',
      code: `<MediaPlayer source={{ from: 'vimeo', id: '76979871' }} title="A wide loop" poster={poster} shape={{ width: 1920, height: 720 }} />
<MediaPlayer source={{ from: 'youtube', id: '…' }} title="A tall clip" poster={poster} shape={{ width: 1080, height: 1920 }} />`,
      render: () => (
        <>
          <MediaPlayer source={{ from: 'vimeo', id: '76979871' }} title="A wide loop" poster={scenes[1].src} posterAlt={scenes[1].alt} shape={{ width: 1920, height: 720 }} caption="A wide video takes only its own height." />
          <MediaPlayer source={{ from: 'youtube', id: 'aqz-KE-bpKQ' }} title="A tall clip" poster={scenes[2].src} posterAlt={scenes[2].alt} shape={{ width: 1080, height: 1920 }} duration={42} caption="A tall video narrows to fit the window." />
        </>
      ),
    },
    {
      title: 'Audio',
      description: 'Compact: the title, the browser’s own controls and the caption, no wider than a readable line. Speech needs its words written out somewhere, so a transcript link follows when there is one.',
      code: `<MediaPlayer kind="audio" source={{ from: 'file', files: [{ src: humWebm, type: 'audio/webm' }, { src: humMp3, type: 'audio/mpeg' }] }} title="Evening hum" caption="Twenty seconds of a slow chord." transcript="/transcripts/evening-hum" />`,
      render: () => <MediaPlayer kind="audio" source={{ from: 'file', files: [{ src: humWebm, type: 'audio/webm' }, { src: humMp3, type: 'audio/mpeg' }] }} title="Evening hum" caption="Twenty seconds of a slow chord, no words." transcript="#/mediaplayer" />,
    },
  ],
} satisfies StoryFile;
