import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Badge } from '../fundamentals/Badge';
import { Button } from '../fundamentals/Button';
import { Image, type PictureTreatment } from '../fundamentals/Image';
import { Link } from '../fundamentals/Link';
import { Select } from '../fundamentals/Select';
import { Text } from '../fundamentals/Text';
import type { DataAttributes } from '../types';

/** A captions or subtitles file: WebVTT, in one language, for native video or an opt-in YouTube overlay. */
export interface MediaTrack {
  src: string;
  /** The language's own name, as the player's captions menu lists it: "English", "Français". */
  label: string;
  /** BCP 47 language tag: "en", "fr". */
  lang: string;
  /** `captions` (default) also describe sounds; `subtitles` translate the words only. */
  kind?: 'captions' | 'subtitles';
  /** Shown from the start. */
  default?: boolean;
}

/** One encoding of a file. List open and common encodings (WebM with VP9 and Opus, MP4 with H.264): each browser plays the first it can. */
export interface MediaFile {
  src: string;
  /** The MIME type, so a browser skips what it can't play without downloading it: `video/webm`, `video/mp4`, `audio/mpeg`. */
  type: string;
}

/** Where the media comes from: files, or YouTube/Vimeo loaded only once played. YouTube tracks opt in to an external
 * caption overlay and labelled language/Off choice, synced through its free iframe API; other embeds are unchanged. */
export type MediaSource = { from: 'file'; files: MediaFile[]; tracks?: MediaTrack[] } | { from: 'youtube'; id: string; tracks?: MediaTrack[] } | { from: 'vimeo'; id: string };

export interface MediaPlayerProps extends DataAttributes {
  /** `video` (default) or `audio`: a compact player with its title above and no picture. */
  kind?: 'video' | 'audio';
  source: MediaSource;
  /** What it is, in a few words. Names the player and the remote frame, and finishes the play button's name ("Play Planet tour"). */
  title: string;
  /** A still shown before playing: the video's own frame, or a picture for an embed (required for an embed: it's all that loads first). */
  poster?: string;
  /** What the poster shows, for an embed's poster; leave it out when the title already says it. */
  posterAlt?: string;
  /** A treatment for an embed's poster (IP31), as Image's `treatment`: `{ rest: 'greyscale', active: 'none' }` shows it in grey until the player is pointed at or focused. Without it the poster is drawn as before. */
  posterTreatment?: PictureTreatment;
  /** The video's own width and height, so the player takes its shape before anything loads. A tall one narrows to fit the window. Default 16 by 9. */
  shape?: { width: number; height: number };
  /** Length in seconds, shown on an embed's poster (an embed can't tell before it loads). */
  duration?: number;
  /** One or two sentences under the player: what it shows and, if it matters, who made it. */
  caption?: string;
  /** Where the words are written out: a transcript page. Needed for audio with speech, and for video whose sound carries meaning. */
  transcript?: string;
}

/** 635 → "10:35"; 3725 → "1:02:05". */
export function formatDuration(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}

/** 635 → "10 minutes 35 seconds", for the play button's name (and ImageGrid's video tiles). */
export function spokenDuration(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  const parts: [number, string][] = [
    [Math.floor(s / 3600), 'hour'],
    [Math.floor((s % 3600) / 60), 'minute'],
    [s % 60, 'second'],
  ];
  return parts
    .filter(([n]) => n)
    .map(([n, unit]) => `${n} ${unit}${n === 1 ? '' : 's'}`)
    .join(' ');
}

const embedSrc = (source: Extract<MediaSource, { from: 'youtube' | 'vimeo' }>) =>
  source.from === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(source.id)}?autoplay=1&rel=0`
    : `https://player.vimeo.com/video/${encodeURIComponent(source.id)}?autoplay=1&dnt=1`;

interface YouTubePlayer {
  getCurrentTime(): number;
  destroy(): void;
}
interface YouTubeAPI {
  Player: new (frame: HTMLIFrameElement, options: { events: { onReady: () => void; onError: () => void } }) => YouTubePlayer;
}
const youtubeWindow = () => window as Window & { YT?: YouTubeAPI; onYouTubeIframeAPIReady?: () => void };
let youtubeAPI: Promise<YouTubeAPI> | undefined;

function loadYouTubeAPI() {
  const host = youtubeWindow();
  if (host.YT?.Player) return Promise.resolve(host.YT);
  if (youtubeAPI) return youtubeAPI;
  youtubeAPI = new Promise<YouTubeAPI>((resolve, reject) => {
    const previous = host.onYouTubeIframeAPIReady;
    const script = document.createElement('script');
    let timer: ReturnType<typeof setTimeout>;
    const cleanup = () => {
      clearTimeout(timer);
      if (host.onYouTubeIframeAPIReady === ready) host.onYouTubeIframeAPIReady = previous;
    };
    const fail = () => {
      cleanup();
      script.remove();
      youtubeAPI = undefined;
      reject(new Error('YouTube player API could not be loaded'));
    };
    const ready = () => {
      cleanup();
      previous?.();
      if (host.YT?.Player) resolve(host.YT);
      else fail();
    };
    host.onYouTubeIframeAPIReady = ready;
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = fail;
    timer = setTimeout(fail, 15000);
    document.head.append(script);
  });
  return youtubeAPI;
}

/** External WebVTT is parsed by the browser, never injected as HTML. No remote API loads before Play. */
function YouTubeCaptions({ source, title }: { source: Extract<MediaSource, { from: 'youtube' }>; title: string }) {
  const tracks = source.tracks ?? [];
  const [selected, setSelected] = useState(tracks.find(track => track.default)?.src ?? '__off');
  const chosen = tracks.find(track => track.src === selected);
  const [cues, setCues] = useState<{ start: number; end: number; text: string }[]>([]);
  const [time, setTime] = useState(0);
  const [loaded, setLoaded] = useState('');
  const [trackFailed, setTrackFailed] = useState(false);
  const [apiState, setAPIState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [retry, setRetry] = useState(0);
  const [trackRetry, setTrackRetry] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const textTrack = useRef<HTMLTrackElement>(null);

  useEffect(() => {
    let disposed = false;
    let player: YouTubePlayer | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;
    setAPIState('loading');
    setTime(0);
    const frame = document.createElement('iframe');
    frame.src = `${embedSrc(source)}&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
    frame.title = title;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    host.current?.append(frame);
    frame.focus();
    const timeout = setTimeout(() => { if (!disposed) setAPIState('failed'); }, 20000);
    void loadYouTubeAPI().then(api => {
      if (disposed) return;
      player = new api.Player(frame, { events: {
        onReady: () => {
          if (disposed) return;
          clearTimeout(timeout);
          setAPIState('ready');
          interval = setInterval(() => { if (player) setTime(player.getCurrentTime()); }, 100);
        },
        onError: () => { if (!disposed) { clearTimeout(timeout); setAPIState('failed'); } },
      } });
    }).catch(() => { if (!disposed) { clearTimeout(timeout); setAPIState('failed'); } });
    return () => {
      disposed = true;
      clearTimeout(timeout);
      clearInterval(interval);
      player?.destroy();
      frame.remove();
    };
  }, [source.id, title, retry]);

  useEffect(() => {
    const node = textTrack.current;
    if (!node) return;
    const timeout = setTimeout(() => setTrackFailed(true), 15000);
    const load = () => {
      clearTimeout(timeout);
      setCues(Array.from(node.track.cues ?? []).filter((cue): cue is VTTCue => cue instanceof VTTCue)
        .map(cue => ({ start: cue.startTime, end: cue.endTime, text: cue.getCueAsHTML().textContent ?? '' })));
      setLoaded(selected);
      setTrackFailed(false);
    };
    const fail = () => { clearTimeout(timeout); setTrackFailed(true); };
    node.addEventListener('load', load);
    node.addEventListener('error', fail);
    node.track.mode = 'hidden';
    if (node.readyState === 2) load();
    else if (node.readyState === 3) fail();
    return () => {
      clearTimeout(timeout);
      node.removeEventListener('load', load);
      node.removeEventListener('error', fail);
    };
  }, [selected, trackRetry, chosen?.src]);

  const caption = apiState === 'ready' && loaded === selected && !trackFailed
    ? cues.filter(cue => cue.start <= time && time < cue.end).map(cue => cue.text).join('\n') : '';
  return <>
    <div data-dl-part="stage">
      <div ref={host} data-dl-part="embed" />
      {caption && <span data-dl-part="captions" lang={chosen?.lang}>{caption}</span>}
      {chosen && <video hidden crossOrigin="anonymous" key={`${selected}:${trackRetry}`}>
        <track ref={textTrack} src={chosen.src} srcLang={chosen.lang} label={chosen.label} default />
      </video>}
    </div>
    <div data-dl-part="caption-controls">
      <Select label="Captions" width="content" mode="form" value={chosen ? selected : '__off'}
        options={[{ value: '__off', label: 'Off' }, ...tracks.map(track => ({ value: track.src, label: track.label }))]}
        onChange={value => { setSelected(value); setTrackFailed(false); setLoaded(''); setCues([]); }} />
      {chosen && (apiState === 'failed' || trackFailed ? <div data-dl-part="caption-status" role="alert">
        <Text variant="body-sm">Captions couldn’t be loaded. Try again or turn captions off.</Text>
        <Button label="Try again" emphasis="quiet" onClick={() => {
          if (apiState === 'failed') setRetry(value => value + 1);
          setTrackFailed(false); setLoaded(''); setCues([]); setTrackRetry(value => value + 1);
        }} />
      </div> : (apiState === 'loading' || loaded !== selected) && <span role="status"><Text variant="body-sm">Loading captions…</Text></span>)}
    </div>
  </>;
}

/**
 * Plays a video or a piece of audio, with its caption: a file this product serves, with the browser's own controls and
 * its captions, or a video on YouTube or Vimeo behind a privacy-friendly poster that loads the remote player only when
 * play is pressed. Not for a picture (use Image), a set of pictures (use Carousel or ImageGrid) or a video that plays by
 * itself as decoration (don't: motion that can't be paused fails WCAG 2.2.2).
 * @tier compound
 * @family content
 * @a11y A `figure` named by its caption when there is one. A file plays in the native `video` or `audio` element with
 * its controls (keyboard operable, announced by the platform) and its WebVTT `track`s, so captions can be turned on.
 * Nothing plays by itself. An embed's poster is one button, "Play" and the title, with the length spoken; pressing it
 * swaps in the remote frame, named by the title, and moves focus into it. The length badge on the poster is
 * `aria-hidden` (the button says it). A transcript link follows the player when given.
 * YouTube sources with tracks add a labelled Captions choice including Off, and a plain-text caption overlay.
 * Track loading failures offer Retry; cues are not a live region that interrupts screen-reader speech.
 * @key Enter, Space: on an embed's poster, loads and plays the video
 */
export function MediaPlayer({ kind = 'video', source, title, poster, posterAlt, posterTreatment, shape = { width: 16, height: 9 }, duration, caption, transcript, ...data }: MediaPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (playing) frame.current?.focus();
  }, [playing]);

  const style = { '--media-player-ratio': `${shape.width} / ${shape.height}`, '--media-player-aspect': shape.width / shape.height } as CSSProperties;

  if (kind === 'audio' && source.from === 'file') {
    return (
      <figure {...data} data-dl="media-player" data-kind="audio">
        <figcaption data-dl-part="title">{title}</figcaption>
        <audio controls preload="metadata" aria-label={title}>
          {source.files.map((f) => (
            <source key={f.src} src={f.src} type={f.type} />
          ))}
        </audio>
        {(caption || transcript) && (
          <p data-dl-part="caption">
            {caption}
            {caption && transcript && ' '}
            {transcript && <Link href={transcript}>Read the transcript</Link>}
          </p>
        )}
      </figure>
    );
  }

  return (
    <figure {...data} data-dl="media-player" data-kind="video" data-tall={shape.height > shape.width ? '' : undefined} style={style}>
      {playing && source.from === 'youtube' && source.tracks?.length ? <YouTubeCaptions key={source.id} source={source} title={title} /> : <div data-dl-part="stage" data-tone-area={posterTreatment ? '' : undefined}>
        {source.from === 'file' ? (
          <video controls preload="metadata" playsInline poster={poster} aria-label={title}>
            {source.files.map((f) => (
              <source key={f.src} src={f.src} type={f.type} />
            ))}
            {source.tracks?.map((t) => (
              <track key={t.src} src={t.src} srcLang={t.lang} label={t.label} kind={t.kind ?? 'captions'} default={t.default} />
            ))}
          </video>
        ) : playing ? (
          <iframe
            ref={frame}
            src={embedSrc(source)}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <>
            {poster && (posterTreatment ? <Image data-dl-part="poster" src={poster} alt={posterAlt ?? ''} rounded={false} treatment={posterTreatment} /> : <img data-dl-part="poster" src={poster} alt={posterAlt ?? ''} />)}
            <span data-dl-part="play">
              <Button
                label={`Play ${title}${duration ? `, ${spokenDuration(duration)}` : ''}`}
                icon="play"
                iconOnly
                tooltip={false}
                emphasis="primary"
                size="xxl"
                onClick={() => setPlaying(true)}
              />
            </span>
            {duration !== undefined && (
              <span data-dl-part="length" aria-hidden="true">
                <Badge emphasis="strong" tone="neutral">
                  {formatDuration(duration)}
                </Badge>
              </span>
            )}
          </>
        )}
      </div>}
      {(caption || transcript) && (
        <figcaption data-dl-part="caption">
          {caption}
          {caption && transcript && ' '}
          {transcript && <Link href={transcript}>Read the transcript</Link>}
        </figcaption>
      )}
    </figure>
  );
}
