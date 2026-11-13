import { useEffect, useState, type ReactNode } from 'react';
import { Avatar, Badge, Button, ButtonGroup, ChipGroup, Heading, Icon, IconOverrides, Link, MenuButton, Navigation, ScrollArea, Slider, Switch, Text, TextField, defineIconPack, type DataAttributes } from '@design-library/core/components';
import { loadFace } from '@design-library/core/fonts';
import type { YoutubeRecord, YoutubeVideo } from '../../types';
import playerPack from '../../icons/pack.json';

/** Guide icons are core names read from content; `of` types them without a cast (LG8). */
const contentIcons = defineIconPack({});
/** The player's filled control glyphs (Material Symbols, Apache-2.0; `icons/`), as the reference draws them. */
const playerIcons = defineIconPack(playerPack);

export interface SiteProps extends DataAttributes {
  /** Validated shared content: the guide, the filters, the videos and every label. */
  view: YoutubeRecord;
  /** A directly openable review state: `home`. */
  screen?: string;
  /** The address of one of this template's layouts (`home`, `watch`, `search`) in its host, the library or the standalone site. */
  href?: (layout: string) => string;
}

/**
 * A video site's home: a masthead with the guide button, a wordmark, search and the signed-out end, the guide at full
 * width, a row of feed filters and a grid of videos. Pictures are neutral frames and every title is original.
 * Not for a single video (a watch page) or a message list (ChatLayout).
 * Buttons, the search field, the filter chips, avatars and scrolling stay in core; this part only arranges them.
 * @tier layout
 * @family youtube
 * @a11y A banner with search, a named guide navigation, and one main landmark holding the filters and the feed.
 */
export function Site({ view, screen = 'home', href = (l) => `#/app/youtube/${l}`, ...data }: SiteProps) {
  const c = view.copy;
  const [query, setQuery] = useState(screen === 'search' ? view.search.query : '');
  const [chip, setChip] = useState([view.chips[0] ?? '']);
  // The guide button: on a wide window it folds the 240 guide to the mini guide; below that it opens the guide as a drawer.
  const [toggled, setToggled] = useState(false);
  useEffect(() => { void loadFace('roboto'); }, []);
  useEffect(() => {
    if (!toggled) return undefined;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setToggled(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [toggled]);

  const start: ReactNode = (
    <>
      <Button label={c.guide} icon="menu" iconOnly emphasis="quiet" onClick={() => setToggled(!toggled)} />
      <Link plain data-dl-part="wordmark" href={href('home')}>
        <span data-dl-part="mark" aria-hidden="true"><Icon name="play" size="sm" /></span>
        <span data-dl-part="word">{view.wordmark}</span>
        <span data-dl-spoken> {c.home}</span>
      </Link>
    </>
  );
  const mini = view.guide.flatMap((s) => s.entries?.filter((e) => e.mini) ?? []);
  const item = (e: { label: string; icon: string }) => ({ id: slug(e.label), label: e.label, href: href('home'), icon: contentIcons.of(e.icon) });
  const current = view.guide.flatMap((s) => s.entries ?? []).find((e) => e.current);
  const currentId = current && slug(current.label);

  return (
    <div {...data} data-dl="youtube-site" data-screen={screen} data-guide={toggled ? 'toggled' : undefined}>
      <header data-dl-part="masthead">
        <div data-dl-part="start">{start}</div>
        <form data-dl-part="center" role="search" onSubmit={(e) => { e.preventDefault(); window.location.assign(href('search')); }}>
          <div data-dl-part="search">
            <TextField label={c.search} hideLabel type="search" clearable placeholder={c.search} value={query} onChange={setQuery} action={{ label: c.search, icon: 'search', iconOnly: true, onAction: () => window.location.assign(href('search')) }} />
          </div>
          <span data-dl-part="voice"><Button label={c.voiceSearch} icon="mic" iconOnly /></span>
        </form>
        <div data-dl-part="end">
          <Button label={c.settings} icon="more-vertical" iconOnly emphasis="quiet" />
          <Button label={c.signIn} icon="person" tone="link" />
        </div>
      </header>
      <nav data-dl-part="mini" aria-label={c.guide}>
        <Navigation presentation="mini" groups={[{ id: 'mini', title: c.guide, items: mini.map(item) }]} current={currentId} />
      </nav>
      <div data-dl-part="scrim" aria-hidden="true" onClick={() => setToggled(false)} />
      <nav data-dl-part="guide" aria-label={c.guide}>
        <div data-dl-part="head">{start}</div>
        <ScrollArea label={c.guide}>
          <div data-dl="youtube-guide">
            {view.guide.map((s) => (
              <section key={s.id} data-dl-part="section" data-titled={s.title ? '' : undefined} aria-label={s.title}>
                {s.prompt && (
                  <div data-dl-part="prompt">
                    <p>{s.prompt}</p>
                    <Button label={c.signIn} icon="person" tone="link" />
                  </div>
                )}
                {s.entries && <Navigation groups={[{ id: s.id, title: s.title, items: s.entries.map(item) }]} current={currentId} />}
              </section>
            ))}
          </div>
        </ScrollArea>
      </nav>
      <main data-dl-part="main">
        {screen === 'watch' ? <Watch view={view} href={href} /> : screen === 'search' ? <Search view={view} href={href} /> : (
        <ScrollArea label={c.feed}>
          <div data-dl="youtube-feed">
            <div data-dl-part="chips">
              <span data-dl-part="chip-scroll"><ScrollArea axis="inline" inset="sm"><ChipGroup label={c.filters} hideLabel wrap={false} selection="single" value={chip} onChange={(v) => setChip(v.length ? v : chip)} chips={view.chips.map((label) => ({ id: label, label }))} /></ScrollArea></span>
            </div>
            <ul data-dl-part="grid" aria-label={c.feed}>
              {view.videos.map((v) => <li key={v.id}><VideoCard video={v} copy={c} to={href('watch')} /></li>)}
            </ul>
          </div>
        </ScrollArea>
        )}
      </main>
    </div>
  );
}

function VideoCard({ video, copy: c, to }: { video: YoutubeVideo; copy: Record<string, string>; to: string }) {
  return (
    <article data-dl="youtube-video">
      <div data-dl-part="frame">
        <Link plain data-dl-part="link" href={to}><span data-dl-spoken>{video.title}</span></Link>
        <span data-dl-part="duration"><Badge size="s" tone="neutral" emphasis="media">{video.duration}</Badge></span>
      </div>
      <div data-dl-part="details">
        <Avatar name={video.channel} size={36} decorative />
        <div data-dl-part="text">
          <Heading level={3} size={4} lines={2}>{video.title}</Heading>
          <div data-dl-part="meta">
            <Text variant="body-sm" tone="muted">{video.channel}</Text>
            <Text variant="body-sm" tone="muted">{video.views} <span aria-hidden="true">•</span> {video.age}</Text>
          </div>
        </div>
        <span data-dl-part="menu">
          <MenuButton
            label={c.videoMenu}
            icon="more-vertical"
            iconOnly
            emphasis="quiet"
            onSelect={() => undefined}
            items={[
              { value: 'queue', label: c.queue },
              { value: 'later', label: c.later },
              { value: 'playlist', label: c.playlist },
              { value: 'share', label: c.share, startsGroup: true },
              { value: 'not-interested', label: c.notInterested },
            ]}
          />
        </span>
      </div>
    </article>
  );
}

/** The watch page (W-1280-L): the player, title, owner row with actions, description and comments; up next beside it. */
function Watch({ view, href }: { view: YoutubeRecord; href: (layout: string) => string }) {
  const c = view.copy;
  const w = view.watch;
  const video = view.videos.find((v) => v.id === w.video) ?? view.videos[0];
  const next = view.videos.filter((v) => v.id !== video.id);
  const [seek, setSeek] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [playing, setPlaying] = useState(true);
  // One column (W-720-L): up next moves between the description and the comments, in reading order too.
  const [oneColumn, setOneColumn] = useState(narrowWatch);
  useEffect(() => {
    const media = window.matchMedia(oneColumnQuery);
    const follow = () => setOneColumn(media.matches);
    media.addEventListener('change', follow);
    return () => media.removeEventListener('change', follow);
  }, []);
  const upNext = (
    <aside data-dl-part="secondary" aria-label={c.upNext}>
      <ul data-dl-part="next">
        {next.map((v) => (
          <li key={v.id} data-dl-part="next-item">
            <div data-dl-part="frame">
              <Link plain data-dl-part="link" href={href('watch')}><span data-dl-spoken>{v.title}</span></Link>
              <span data-dl-part="duration"><Badge size="s" tone="neutral" emphasis="media">{v.duration}</Badge></span>
            </div>
            <div data-dl-part="next-text">
              <Heading level={3} size="label" lines={2}>{v.title}</Heading>
              <Text variant="caption" tone="muted">{v.channel}</Text>
              <Text variant="caption" tone="muted">{v.views} <span aria-hidden="true">•</span> {v.age}</Text>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
  return (
    <ScrollArea label={video.title}>
      <div data-dl="youtube-watch">
        <div data-dl-part="primary">
          <div data-dl-part="player" data-scheme="dark" data-aspect={video.aspect}>
            <div data-dl-part="screen" role="img" aria-label={c.player} />
            <IconOverrides icons={playerPack.glyphs}>
            <div data-dl-part="controls">
              <div data-dl-part="seek"><Slider label={c.seek} hideLabel showValue={false} size="s" min={0} max={100} value={seek} onChange={(v) => setSeek(v as number)} /></div>
              <div data-dl-part="left">
                <span data-dl-part="round"><Button label={playing ? c.pause : c.play} icon={playerIcons.name(playing ? 'player-pause' : 'player-play')} iconOnly emphasis="quiet" tone="inherit" onClick={() => setPlaying(!playing)} /></span>
                <span data-dl-part="round"><Button label={c.mute} icon={playerIcons.name('player-volume')} iconOnly emphasis="quiet" tone="inherit" /></span>
                <span data-dl-part="time"><Text variant="inherit">0:00 / {video.duration}</Text></span>
              </div>
              <div data-dl-part="right">
                <span data-dl-part="slot"><Switch label={c.autoplay} hideLabel size="xs" checked={autoplay} onChange={setAutoplay} thumbIcon={playerIcons.name('player-play')} /></span>
                <span data-dl-part="slot"><Button label={c.captions} icon={playerIcons.name('player-captions')} iconOnly emphasis="quiet" tone="inherit" /></span>
                <span data-dl-part="slot"><Button label={c.settings} icon={playerIcons.name('player-settings')} iconOnly emphasis="quiet" tone="inherit" /></span>
                <span data-dl-part="slot"><Button label={c.theatre} icon={playerIcons.name('player-theatre')} iconOnly emphasis="quiet" tone="inherit" /></span>
                <span data-dl-part="slot"><Button label={c.fullscreen} icon={playerIcons.name('player-fullscreen')} iconOnly emphasis="quiet" tone="inherit" /></span>
              </div>
            </div>
            </IconOverrides>
          </div>
          <div data-dl-part="title">
            <Heading level={1} size={3} lines={2}>{video.title}</Heading>
          </div>
          <div data-dl-part="owner-row">
            <div data-dl-part="owner">
              <Avatar name={video.channel} size={40} decorative />
              <div data-dl-part="owner-text">
                <span data-dl-part="channel"><Text variant="inherit">{video.channel}</Text></span>
                <Text variant="caption" tone="muted">{w.subscribers}</Text>
              </div>
              <span data-dl-part="subscribe"><Button label={c.subscribe} emphasis="strong" /></span>
            </div>
            <div data-dl-part="actions">
              <ButtonGroup label={c.like} arrangement="attached">
                <Button label={w.likes} icon="thumb-up" />
                <Button label={c.dislike} icon="thumb-down" iconOnly />
              </ButtonGroup>
              <Button label={c.share} icon="share" iconOnly />
              <Button label={c.download} icon="arrow-down" iconOnly />
              <Button label={c.save} icon="bookmark" iconOnly />
              <MenuButton label={c.more} icon="more" iconOnly onSelect={() => undefined} items={[{ value: 'later', label: c.later }, { value: 'playlist', label: c.playlist }]} />
            </div>
          </div>
          <div data-dl-part="description">
            <span data-dl-part="stats"><Text variant="inherit">{w.stats}</Text></span>
            <Text variant="body-sm">{w.description}</Text>
          </div>
          {oneColumn && upNext}
          <section data-dl-part="comments" aria-label={c.comments}>
            <div data-dl-part="comments-head">
              <Heading level={2} size={3}>{w.commentCount}</Heading>
              <span data-dl-part="sort">
                <IconOverrides icons={playerPack.glyphs}>
                  <Button label={c.sortBy} icon={playerIcons.name('comments-sort')} emphasis="quiet" />
                </IconOverrides>
              </span>
            </div>
            <div data-dl-part="add">
              <Avatar name={c.signIn} size={24} decorative />
              <TextField label={c.addComment} hideLabel appearance="underline" size="xs" placeholder={c.addComment} value="" onChange={() => undefined} />
            </div>
            <ul data-dl-part="thread">
              {w.comments.map((m) => (
                <li key={m.author} data-dl-part="comment">
                  <Avatar name={m.author.replace('@', '')} size={36} decorative />
                  <div data-dl-part="comment-body">
                    <span data-dl-part="author"><Text variant="inherit">{m.author}</Text> <Text variant="caption" tone="muted">{m.age}</Text></span>
                    <Text variant="body-sm">{m.text}</Text>
                    <div data-dl-part="comment-actions">
                      <Button label={c.like} icon="thumb-up" iconOnly emphasis="quiet" size="s" />
                      <Text variant="caption" tone="muted">{m.likes}</Text>
                      <Button label={c.dislike} icon="thumb-down" iconOnly emphasis="quiet" size="s" />
                      <Button label={c.reply} emphasis="quiet" size="s" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
        {!oneColumn && upNext}
      </div>
    </ScrollArea>
  );
}

/** Search results (S-1280-L): filters with Filters at the end, then one row per video, its frame beside its words. */
function Search({ view, href }: { view: YoutubeRecord; href: (layout: string) => string }) {
  const c = view.copy;
  const s = view.search;
  const [chip, setChip] = useState([s.chips[0] ?? '']);
  const results = s.results.flatMap((r) => {
    const v = view.videos.find((x) => x.id === r.video);
    return v ? [{ ...r, v }] : [];
  });
  return (
    <ScrollArea label={c.results}>
      <div data-dl="youtube-results">
        <div data-dl-part="chips">
          <span data-dl-part="chip-scroll"><ScrollArea axis="inline" inset="sm"><ChipGroup label={c.filters} hideLabel wrap={false} selection="single" value={chip} onChange={(x) => setChip(x.length ? x : chip)} chips={s.chips.map((label) => ({ id: label, label }))} /></ScrollArea></span>
          <IconOverrides icons={playerPack.glyphs}>
            <Button label={c.filtersButton} icon={playerIcons.name('filters-tune')} emphasis="quiet" iconEnd />
          </IconOverrides>
        </div>
        <ul data-dl-part="list" aria-label={c.results}>
          {results.map(({ v, snippet, badges, chapters }) => (
            <li key={v.id} data-dl-part="result">
              <div data-dl-part="frame">
                <Link plain data-dl-part="link" href={href('watch')}><span data-dl-spoken>{v.title}</span></Link>
                <span data-dl-part="duration"><Badge size="s" tone="neutral" emphasis="media">{v.duration}</Badge></span>
              </div>
              <div data-dl-part="text">
                <div data-dl-part="title">
                  <Heading level={2} size={2} lines={2}>{v.title}</Heading>
                  <span data-dl-part="menu">
                    <MenuButton label={c.videoMenu} icon="more-vertical" iconOnly emphasis="quiet" onSelect={() => undefined} items={[{ value: 'queue', label: c.queue }, { value: 'later', label: c.later }, { value: 'playlist', label: c.playlist }]} />
                  </span>
                </div>
                <Text variant="caption" tone="muted">{v.views} <span aria-hidden="true">•</span> {v.age}</Text>
                <div data-dl-part="channel">
                  <Avatar name={v.channel} size={24} decorative />
                  <span data-dl-part="name"><Text variant="caption" tone="muted">{v.channel}</Text></span>
                </div>
                <span data-dl-part="snippet"><Text variant="caption">{snippet}</Text></span>
                {badges && badges.length > 0 && <span data-dl-part="badges">{badges.map((b) => <Badge key={b} size="s" tone="neutral" emphasis="outline">{b}</Badge>)}</span>}
                {chapters && (
                  <div data-dl-part="chapters">
                    <span data-dl-part="chapter-frame" aria-hidden="true" />
                    <span data-dl-part="chapter-count"><Text variant="inherit" as="span">{chapters.count}</Text></span>
                    <span data-dl-part="chapter-titles"><Text variant="inherit" as="span">{chapters.titles}</Text></span>
                    <IconOverrides icons={playerPack.glyphs}>
                      <Button label={c.showChapters} icon={playerIcons.name('chapters-expand')} iconOnly emphasis="quiet" size="s" />
                    </IconOverrides>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ScrollArea>
  );
}

const slug = (label: string) => label.toLowerCase().replace(/\s+/g, '-');
/** The watch page's one-column width, as site.css has it. */
const oneColumnQuery = '(max-width: 64rem)';
const narrowWatch = () => typeof window !== 'undefined' && window.matchMedia(oneColumnQuery).matches;
