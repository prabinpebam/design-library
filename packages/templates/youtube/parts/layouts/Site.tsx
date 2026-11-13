import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Avatar, Badge, Button, ButtonGroup, ChipGroup, Heading, Icon, IconOverrides, Image, Link, MenuButton, Navigation, ScrollArea, Slider, Switch, Text, TextField, defineIconPack, notify, type DataAttributes, type MenuButtonItem } from '@design-library/core/components';
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
  /** The address's values: `v` is the video the watch page plays (the content's `watch.video` when it names none). */
  params?: Record<string, string>;
  /** A picture by its asset id (the host's `ctx.picture`); without it, frames stay plain. */
  picture?: (id: string) => Pic;
}

/** A picture from the template's `assets.json`. */
type Pic = { src: string; alt: string };

/**
 * A video site's home: a masthead with the guide button, a wordmark, search and the signed-out end, the guide at full
 * width, a row of feed filters and a grid of videos. Pictures are neutral frames and every title is original.
 * Not for a single video (a watch page) or a message list (ChatLayout).
 * Buttons, the search field, the filter chips, avatars and scrolling stay in core; this part only arranges them.
 * @tier layout
 * @family youtube
 * @a11y A banner with search, a named guide navigation, and one main landmark holding the filters and the feed.
 */
export function Site({ view, screen = 'home', href = (l) => `#/app/youtube/${l}`, params, picture, ...data }: SiteProps) {
  const thumb = (v: YoutubeVideo) => (v.thumbnail && picture ? picture(v.thumbnail) : undefined);
  const face = (v: YoutubeVideo) => (v.avatar && picture ? picture(v.avatar).src : undefined);
  const c = view.copy;
  const asked = screen === 'search' ? (params?.q ?? view.search.query) : '';
  const [query, setQuery] = useState(asked);
  useEffect(() => setQuery(asked), [asked]);
  const find = () => window.location.assign(href(query.trim() ? `search?q=${encodeURIComponent(query.trim())}` : 'search'));
  const [signedIn, setSignedIn] = useState(false);
  const [scheme, setScheme] = useState<Scheme>('device');
  const [hidden, setHidden] = useState<string[]>([]);
  // A card's more menu: not interested takes the video out of the feed (with Undo); the rest say what happened.
  const onVideo = (v: YoutubeVideo, action: string) => {
    if (action === 'not-interested') {
      setHidden((h) => [...h, v.id]);
      notify({ subject: 'video-menu', message: c.removed, action: { label: c.undo, onAction: () => setHidden((h) => h.filter((id) => id !== v.id)) } });
    } else notify({ subject: 'video-menu', tone: 'success', message: c[`done-${action}`] ?? c.done });
  };
  const appearance: MenuButtonItem = {
    value: 'appearance',
    label: `${c.appearance}: ${c[`theme-${scheme}`]}`,
    icon: schemeIcon[scheme],
    items: schemes.map((x) => ({ value: `theme-${x}`, label: c[`theme-${x}`], checked: x === scheme })),
  };
  const onAccount = (v: string) => {
    if (v.startsWith('theme-')) setScheme(v.slice(6) as Scheme);
    else if (v === 'sign-out') setSignedIn(false);
    else if (v === 'sign-in') setSignedIn(true);
    else notify({ subject: 'account', message: c.notBuilt });
  };
  const signIn = () => setSignedIn(true);
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
      <Link plain data-dl-part="wordmark" href={href('home')} current={screen === 'home' && !params?.feed}>
        <span data-dl-part="mark" aria-hidden="true"><Icon name="play" size="sm" /></span>
        <span data-dl-part="word">{view.wordmark}</span>
        <span data-dl-spoken> {c.home}</span>
      </Link>
    </>
  );
  const mini = view.guide.flatMap((s) => s.entries?.filter((e) => e.mini) ?? []);
  // Each guide destination is a feed of the home screen (`home?feed=<id>`); the first entry is the whole feed.
  const item = (e: { label: string; icon: string; current?: boolean }) => ({ id: slug(e.label), label: e.label, href: href(e.current ? 'home' : `home?feed=${slug(e.label)}`), icon: contentIcons.of(e.icon) });
  const entries = view.guide.flatMap((s) => s.entries ?? []);
  const current = (screen === 'home' && params?.feed && entries.find((e) => slug(e.label) === params.feed)) || entries.find((e) => e.current);
  const currentId = current && slug(current.label);
  const feed = current?.current ? view.videos : view.videos.filter((v) => current?.videos?.includes(v.id));
  const shown = feed.filter((v) => !hidden.includes(v.id) && (view.chipVideos?.[chip[0]]?.includes(v.id) ?? true));

  return (
    <div {...data} data-dl="youtube-site" data-screen={screen} data-guide={toggled ? 'toggled' : undefined} data-scheme={scheme === 'device' ? undefined : scheme}>
      <header data-dl-part="masthead">
        <div data-dl-part="start">{start}</div>
        <form data-dl-part="center" role="search" onSubmit={(e) => { e.preventDefault(); find(); }}>
          <div data-dl-part="search">
            <TextField label={c.search} hideLabel type="search" clearable placeholder={c.search} value={query} onChange={setQuery} action={{ label: c.search, icon: 'search', iconOnly: true, onAction: find }} />
          </div>
          <span data-dl-part="voice"><Button label={c.voiceSearch} icon="mic" iconOnly onClick={() => notify({ subject: 'voice', message: c.notBuilt })} /></span>
        </form>
        <div data-dl-part="end">
          {signedIn ? (
            <>
              <MenuButton label={c.create} icon="plus" chevron={false} items={[{ value: 'upload', label: c.upload, icon: 'upload' }, { value: 'live', label: c.goLive, icon: 'video' }, { value: 'post', label: c.post, icon: 'edit' }]} onSelect={onAccount} />
              <MenuButton label={c.notifications} heading={c.notifications} icon="bell" iconOnly emphasis="quiet" listWidth="sm" items={view.notifications.map((n, i) => ({ value: `n${i}`, label: n.text, description: n.age }))} onSelect={onAccount} />
              <MenuButton label={c.account} iconOnly emphasis="quiet" avatar={{ name: view.account.name, src: view.account.avatar && picture ? picture(view.account.avatar).src : undefined }} heading={view.account.name} items={[{ value: 'channel', label: c.yourChannel, icon: 'person' }, appearance, { value: 'help', label: c.help, icon: 'help', startsGroup: true }, { value: 'sign-out', label: c.signOut, startsGroup: true }]} onSelect={onAccount} />
            </>
          ) : (
            <>
              <MenuButton label={c.settings} icon="more-vertical" iconOnly emphasis="quiet" items={[appearance, { value: 'help', label: c.help, icon: 'help', startsGroup: true }, { value: 'feedback', label: c.feedback, icon: 'flag' }]} onSelect={onAccount} />
              <Button label={c.signIn} icon="person" tone="link" onClick={signIn} />
            </>
          )}
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
                {s.prompt && !signedIn && (
                  <div data-dl-part="prompt">
                    <p>{s.prompt}</p>
                    <Button label={c.signIn} icon="person" tone="link" onClick={signIn} />
                  </div>
                )}
                {s.entries && <Navigation groups={[{ id: s.id, title: s.title, items: s.entries.map(item) }]} current={currentId} />}
              </section>
            ))}
          </div>
        </ScrollArea>
      </nav>
      <main data-dl-part="main">
        {screen === 'watch' ? <Watch key={params?.v} view={view} href={href} video={params?.v} thumb={thumb} face={face} onVideo={onVideo} /> : screen === 'search' ? <Search key={asked} view={view} href={href} query={asked} thumb={thumb} face={face} hidden={hidden} onVideo={onVideo} /> : (
        <ScrollArea label={c.feed}>
          <div data-dl="youtube-feed">
            <div data-dl-part="chips">
              <span data-dl-part="chip-scroll"><ScrollArea axis="inline" inset="sm"><ChipGroup label={c.filters} hideLabel wrap={false} selection="single" value={chip} onChange={(v) => setChip(v.length ? v : chip)} chips={view.chips.map((label) => ({ id: label, label }))} /></ScrollArea></span>
            </div>
            <ul data-dl-part="grid" aria-label={c.feed}>
              {shown.length === 0 && <li data-dl-part="empty"><Text variant="body-sm" tone="muted">{feed.length ? c.noResults : c.notBuilt}</Text></li>}
              {shown.map((v) => <li key={v.id}><VideoCard video={v} copy={c} to={href(`watch?v=${v.id}`)} picture={thumb(v)} face={face(v)} onAction={(a) => onVideo(v, a)} /></li>)}
            </ul>
          </div>
        </ScrollArea>
        )}
      </main>
    </div>
  );
}

function VideoCard({ video, copy: c, to, picture, face, onAction }: { video: YoutubeVideo; copy: Record<string, string>; to: string; picture?: Pic; face?: string; onAction: (action: string) => void }) {
  return (
    <article data-dl="youtube-video">
      <div data-dl-part="frame">
        <Thumb picture={picture} />
        <Link plain data-dl-part="link" href={to}><span data-dl-spoken>{video.title}</span></Link>
        <span data-dl-part="duration"><Badge size="s" tone="neutral" emphasis="media">{video.duration}</Badge></span>
      </div>
      <div data-dl-part="details">
        <Avatar name={video.channel} src={face} size={36} decorative />
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
            onSelect={onAction}
            items={videoMenu(c)}
          />
        </span>
      </div>
    </article>
  );
}

/** A video's more menu, the same on cards, results and up next. */
const videoMenu = (c: Record<string, string>): MenuButtonItem[] => [
  { value: 'queue', label: c.queue },
  { value: 'later', label: c.later },
  { value: 'playlist', label: c.playlist },
  { value: 'share', label: c.share, startsGroup: true },
  { value: 'not-interested', label: c.notInterested },
];

/** The watch page (W-1280-L): the player, title, owner row with actions, description and comments; up next beside it. */
function Watch({ view, href, video: chosen, thumb, face, onVideo }: { view: YoutubeRecord; href: (layout: string) => string; video?: string; thumb: (v: YoutubeVideo) => Pic | undefined; face: (v: YoutubeVideo) => string | undefined; onVideo: (v: YoutubeVideo, action: string) => void }) {
  const c = view.copy;
  const w = view.watch;
  const video = view.videos.find((v) => v.id === (chosen ?? w.video)) ?? view.videos[0];
  const next = view.videos.filter((v) => v.id !== video.id);
  const shown = thumb(video);
  const [seek, setSeek] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [speed, setSpeed] = useState('1');
  const [subscribed, setSubscribed] = useState(false);
  const [opinion, setOpinion] = useState<'like' | 'dislike'>();
  const [sort, setSort] = useState<'top' | 'newest'>('top');
  const comments = sort === 'top' ? w.comments : [...w.comments].sort((a, b) => ageDays(a.age) - ageDays(b.age));
  const player = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);
  // Theatre mode: the player leaves the first column and spans the page above both columns.
  const [theatre, setTheatre] = useState(false);
  useEffect(() => {
    const follow = () => setFull(document.fullscreenElement === player.current);
    document.addEventListener('fullscreenchange', follow);
    return () => document.removeEventListener('fullscreenchange', follow);
  }, []);
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
              <Thumb picture={thumb(v)} />
              <Link plain data-dl-part="link" href={href(`watch?v=${v.id}`)}><span data-dl-spoken>{v.title}</span></Link>
              <span data-dl-part="duration"><Badge size="s" tone="neutral" emphasis="media">{v.duration}</Badge></span>
            </div>
            <div data-dl-part="next-text">
              <Heading level={3} size="label" lines={2}>{v.title}</Heading>
              <Text variant="caption" tone="muted">{v.channel}</Text>
              <Text variant="caption" tone="muted">{v.views} <span aria-hidden="true">•</span> {v.age}</Text>
            </div>
            <span data-dl-part="menu"><MenuButton label={c.videoMenu} icon="more-vertical" iconOnly emphasis="quiet" size="s" onSelect={(a) => onVideo(v, a)} items={videoMenu(c)} /></span>
          </li>
        ))}
      </ul>
    </aside>
  );
  const playerEl = (
    <div data-dl-part="player" data-scheme="dark" data-aspect={video.aspect} data-state={playing ? 'playing' : 'paused'} ref={player}>
      {shown ? <span data-dl-part="screen"><Image src={shown.src} alt={shown.alt} ratio="fill" priority /></span> : <div data-dl-part="screen" role="img" aria-label={c.player} />}
      <IconOverrides icons={playerPack.glyphs}>
      <div data-dl-part="controls">
        <div data-dl-part="seek"><Slider label={c.seek} hideLabel showValue={false} size="s" min={0} max={100} value={seek} onChange={(v) => setSeek(v as number)} /></div>
        <div data-dl-part="left">
          <span data-dl-part="round"><Button label={playing ? c.pause : c.play} icon={playerIcons.name(playing ? 'player-pause' : 'player-play')} iconOnly emphasis="quiet" tone="inherit" onClick={() => setPlaying(!playing)} /></span>
          <span data-dl-part="round"><Button label={muted ? c.unmute : c.mute} icon={playerIcons.name('player-volume')} iconOnly emphasis="quiet" tone="inherit" onClick={() => setMuted(!muted)} /></span>
          <span data-dl-part="time"><Text variant="inherit">0:00 / {video.duration}</Text></span>
        </div>
        <div data-dl-part="right">
          <span data-dl-part="slot"><Switch label={c.autoplay} hideLabel size="xs" checked={autoplay} onChange={setAutoplay} thumbIcon={playerIcons.name('player-play')} /></span>
          {/* toggle-button: the player's dense control bar, as the reference; the glyph shows the state */}
          <span data-dl-part="slot"><Button label={c.captions} icon={playerIcons.name('player-captions')} iconOnly emphasis="quiet" tone="inherit" pressed={captions} onClick={() => setCaptions(!captions)} /></span>
          <span data-dl-part="slot"><MenuButton label={c.settings} icon={playerIcons.name('player-settings')} iconOnly emphasis="quiet" tone="inherit" side="block" onSelect={(v) => setSpeed(v.slice(6))} items={[{ value: 'speed', label: c.speed, meta: speed === '1' ? c.normal : speed, items: speeds.map((x) => ({ value: `speed-${x}`, label: x === '1' ? c.normal : x, checked: x === speed })) }]} /></span>
          <span data-dl-part="slot"><Button label={theatre ? c.defaultView : c.theatre} icon={playerIcons.name('player-theatre')} iconOnly emphasis="quiet" tone="inherit" onClick={() => setTheatre(!theatre)} /></span>
          <span data-dl-part="slot"><Button label={full ? c.exitFullscreen : c.fullscreen} icon={playerIcons.name('player-fullscreen')} iconOnly emphasis="quiet" tone="inherit" onClick={() => void (document.fullscreenElement ? document.exitFullscreen() : player.current?.requestFullscreen?.())} /></span>
        </div>
      </div>
      </IconOverrides>
    </div>
  );
  return (
    <ScrollArea label={video.title}>
      <div data-dl="youtube-watch" data-view={theatre ? 'theatre' : undefined}>
        {theatre && playerEl}
        <div data-dl-part="primary">
          {!theatre && playerEl}
          <div data-dl-part="title">
            <Heading level={1} size={3} lines={2}>{video.title}</Heading>
          </div>
          <div data-dl-part="owner-row">
            <div data-dl-part="owner">
              <Avatar name={video.channel} src={face(video)} size={40} decorative />
              <div data-dl-part="owner-text">
                <span data-dl-part="channel"><Text variant="inherit">{video.channel}</Text></span>
                <Text variant="caption" tone="muted">{w.subscribers}</Text>
              </div>
              <span data-dl-part="subscribe"><Button label={subscribed ? c.subscribed : c.subscribe} emphasis={subscribed ? 'default' : 'strong'} onClick={() => setSubscribed(!subscribed)} /></span>
            </div>
            <div data-dl-part="actions">
              <ButtonGroup label={c.like} arrangement="attached">
                {/* toggle-button: like and dislike are a pressed pair with a count, as the reference; Switch can't carry them */}
                <Button label={opinion === 'like' ? bump(w.likes) : w.likes} icon="thumb-up" pressed={opinion === 'like'} onClick={() => setOpinion(opinion === 'like' ? undefined : 'like')} />
                {/* toggle-button: see above */}
                <Button label={c.dislike} icon="thumb-down" iconOnly pressed={opinion === 'dislike'} onClick={() => setOpinion(opinion === 'dislike' ? undefined : 'dislike')} />
              </ButtonGroup>
              <Button label={c.share} icon="share" iconOnly onClick={() => notify({ subject: 'video-menu', tone: 'success', message: c['done-share'] })} />
              <Button label={c.download} icon="arrow-down" iconOnly onClick={() => notify({ subject: 'video-menu', message: c.notBuilt })} />
              <Button label={c.save} icon="bookmark" iconOnly onClick={() => onVideo(video, 'later')} />
              <MenuButton label={c.more} icon="more" iconOnly onSelect={(a) => onVideo(video, a)} items={[{ value: 'later', label: c.later }, { value: 'playlist', label: c.playlist }]} />
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
                  <MenuButton label={c.sortBy} icon={playerIcons.name('comments-sort')} chevron={false} emphasis="quiet" onSelect={(v) => setSort(v as 'top' | 'newest')} items={[{ value: 'top', label: c.topComments, checked: sort === 'top' }, { value: 'newest', label: c.newestFirst, checked: sort === 'newest' }]} />
                </IconOverrides>
              </span>
            </div>
            <div data-dl-part="add">
              <Avatar name={c.signIn} size={24} decorative />
              <TextField label={c.addComment} hideLabel appearance="underline" size="xs" placeholder={c.addComment} value="" onChange={() => undefined} />
            </div>
            <ul data-dl-part="thread">
              {comments.map((m) => <Comment key={m.author} comment={m} copy={c} />)}
            </ul>
          </section>
        </div>
        {!oneColumn && upNext}
      </div>
    </ScrollArea>
  );
}

/** Search results (S-1280-L): filters with Filters at the end, then one row per video, its frame beside its words. */
function Search({ view, href, query, thumb, face, hidden, onVideo }: { view: YoutubeRecord; href: (layout: string) => string; query: string; thumb: (v: YoutubeVideo) => Pic | undefined; face: (v: YoutubeVideo) => string | undefined; hidden: string[]; onVideo: (v: YoutubeVideo, action: string) => void }) {
  const c = view.copy;
  const s = view.search;
  const [chip, setChip] = useState([s.chips[0] ?? '']);
  const [filters, setFilters] = useState<string[]>([]);
  const [chapterOpen, setChapterOpen] = useState<string[]>([]);
  const results = searchResults(view, query).filter((r) => !hidden.includes(r.v.id));
  return (
    <ScrollArea label={c.results}>
      <div data-dl="youtube-results">
        <div data-dl-part="chips">
          <span data-dl-part="chip-scroll"><ScrollArea axis="inline" inset="sm"><ChipGroup label={c.filters} hideLabel wrap={false} selection="single" value={chip} onChange={(x) => setChip(x.length ? x : chip)} chips={s.chips.map((label) => ({ id: label, label }))} /></ScrollArea></span>
          <IconOverrides icons={playerPack.glyphs}>
            <MenuButton label={c.filtersButton} icon={playerIcons.name('filters-tune')} emphasis="quiet" iconEnd chevron={false} listWidth="sm"
              onSelect={(v) => setFilters((f) => { const group = v.split(':')[0]; return f.includes(v) ? f.filter((x) => x !== v) : [...f.filter((x) => !x.startsWith(`${group}:`)), v]; })}
              items={s.filters.flatMap((g) => g.options.map((o, i) => ({ value: `${g.id}:${slug(o)}`, label: o, heading: i === 0 ? g.title : undefined, startsGroup: i === 0, checked: filters.includes(`${g.id}:${slug(o)}`) })))} />
          </IconOverrides>
        </div>
        <ul data-dl-part="list" aria-label={c.results}>
          {results.length === 0 && <li data-dl-part="empty"><Text variant="body-sm" tone="muted">{c.noResults}</Text></li>}
          {results.map(({ v, snippet, badges, chapters }) => (
            <li key={v.id} data-dl-part="result">
              <div data-dl-part="frame">
                <Thumb picture={thumb(v)} />
                <Link plain data-dl-part="link" href={href(`watch?v=${v.id}`)}><span data-dl-spoken>{v.title}</span></Link>
                <span data-dl-part="duration"><Badge size="s" tone="neutral" emphasis="media">{v.duration}</Badge></span>
              </div>
              <div data-dl-part="text">
                <div data-dl-part="title">
                  <Heading level={2} size={2} lines={2}>{v.title}</Heading>
                  <span data-dl-part="menu">
                    <MenuButton label={c.videoMenu} icon="more-vertical" iconOnly emphasis="quiet" onSelect={(a) => onVideo(v, a)} items={videoMenu(c)} />
                  </span>
                </div>
                <Text variant="caption" tone="muted">{v.views} <span aria-hidden="true">•</span> {v.age}</Text>
                <div data-dl-part="channel">
                  <Avatar name={v.channel} src={face(v)} size={24} decorative />
                  <span data-dl-part="name"><Text variant="caption" tone="muted">{v.channel}</Text></span>
                </div>
                <span data-dl-part="snippet"><Text variant="caption">{snippet}</Text></span>
                {badges && badges.length > 0 && <span data-dl-part="badges">{badges.map((b) => <Badge key={b} size="s" tone="neutral" emphasis="outline">{b}</Badge>)}</span>}
                {chapters && (
                  <div data-dl-part="chapters" data-expanded={chapterOpen.includes(v.id) ? '' : undefined}>
                    <span data-dl-part="chapter-frame" aria-hidden="true" />
                    <span data-dl-part="chapter-count"><Text variant="inherit" as="span">{chapters.count}</Text></span>
                    <span data-dl-part="chapter-titles" id={`chapters-${v.id}`}><Text variant="inherit" as="span">{chapters.titles}</Text></span>
                    <IconOverrides icons={playerPack.glyphs}>
                      <Button label={c.showChapters} icon={playerIcons.name('chapters-expand')} iconOnly emphasis="quiet" size="s" expanded={chapterOpen.includes(v.id)} controls={`chapters-${v.id}`} onClick={() => setChapterOpen((o) => (o.includes(v.id) ? o.filter((x) => x !== v.id) : [...o, v.id]))} />
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

type Scheme = 'device' | 'dark' | 'light';
const schemes: Scheme[] = ['device', 'dark', 'light'];
const schemeIcon = { device: 'scheme-system', dark: 'scheme-dark', light: 'scheme-light' } as const;
const speeds = ['0.5', '1', '1.5', '2'];
/** "2 days ago" in days, to order comments newest first. */
const ageDays = (age: string) => {
  const m = /(\d+)\s+(hour|day|week|month|year)/.exec(age);
  return m ? Number(m[1]) * { hour: 1 / 24, day: 1, week: 7, month: 30, year: 365 }[m[2] as 'day'] : 0;
};
/** A like count after the viewer's own like: "9.4K" stays as it reads, "312" becomes "313". */
const bump = (count: string) => (/^\d+$/.test(count) ? String(Number(count) + 1) : count);

/**
 * The results for the asked words: the content's results for its own query; otherwise every video whose title,
 * channel or snippet holds one of the words (of three letters or more), best match first.
 */
function searchResults(view: YoutubeRecord, query: string) {
  const s = view.search;
  const listed = s.results.flatMap((r) => {
    const v = view.videos.find((x) => x.id === r.video);
    return v ? [{ ...r, v }] : [];
  });
  const words = query.toLowerCase().split(/\W+/).filter((x) => x.length > 2);
  if (query.trim().toLowerCase() === s.query.toLowerCase() || !words.length) return listed;
  const pool = view.videos.map((v) => listed.find((r) => r.v.id === v.id) ?? { video: v.id, snippet: '', v, badges: undefined, chapters: undefined });
  const score = (r: (typeof pool)[number]) => words.filter((x) => `${r.v.title} ${r.v.channel} ${r.snippet}`.toLowerCase().includes(x)).length;
  return pool.map((r) => ({ r, n: score(r) })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).map((x) => x.r);
}

/** One comment, its like and dislike a pressed pair. */
function Comment({ comment: m, copy: c }: { comment: YoutubeRecord['watch']['comments'][number]; copy: Record<string, string> }) {
  const [opinion, setOpinion] = useState<'like' | 'dislike'>();
  return (
    <li data-dl-part="comment">
      <Avatar name={m.author.replace('@', '')} size={36} decorative />
      <div data-dl-part="comment-body">
        <span data-dl-part="author"><Text variant="inherit">{m.author}</Text> <Text variant="caption" tone="muted">{m.age}</Text></span>
        <Text variant="body-sm">{m.text}</Text>
        <div data-dl-part="comment-actions">
          {/* toggle-button: a comment row's dense like and dislike pair, as the reference */}
          <Button label={c.like} icon="thumb-up" iconOnly emphasis="quiet" size="s" pressed={opinion === 'like'} onClick={() => setOpinion(opinion === 'like' ? undefined : 'like')} />
          <Text variant="caption" tone="muted">{opinion === 'like' ? bump(m.likes) : m.likes}</Text>
          {/* toggle-button: see above */}
          <Button label={c.dislike} icon="thumb-down" iconOnly emphasis="quiet" size="s" pressed={opinion === 'dislike'} onClick={() => setOpinion(opinion === 'dislike' ? undefined : 'dislike')} />
          <Button label={c.reply} emphasis="quiet" size="s" onClick={() => notify({ subject: 'comment', message: c.signInToReply })} />
        </div>
      </div>
    </li>
  );
}
/** The watch page's one-column width, as site.css has it. */
const oneColumnQuery = '(max-width: 64rem)';
const narrowWatch = () => typeof window !== 'undefined' && window.matchMedia(oneColumnQuery).matches;

/** A video's thumbnail filling its frame, under the frame's link and duration; decorative, as the link names the video. */
function Thumb({ picture }: { picture?: Pic }) {
  return picture ? <span data-dl-part="thumb"><Image src={picture.src} alt="" ratio="fill" loading="lazy" /></span> : null;
}
