import { useEffect, useState, type ReactNode } from 'react';
import { Avatar, Badge, Button, ChipGroup, Heading, Icon, MenuButton, ScrollArea, Text, TextField, type DataAttributes, type IconName } from '@design-library/core/components';
import { loadFace } from '@design-library/core/fonts';
import type { YoutubeRecord, YoutubeVideo } from '../../types';

export interface SiteProps extends DataAttributes {
  /** Validated shared content: the guide, the filters, the videos and every label. */
  view: YoutubeRecord;
  /** A directly openable review state: `home`. */
  screen?: string;
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
export function Site({ view, screen = 'home', ...data }: SiteProps) {
  const c = view.copy;
  const [query, setQuery] = useState('');
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
      <a data-dl-part="wordmark" href="#home" aria-label={`${view.wordmark} ${c.home}`}>
        <span data-dl-part="mark" aria-hidden="true"><Icon name="play" size="sm" /></span>
        <span data-dl-part="word">{view.wordmark}</span>
      </a>
    </>
  );
  const mini = view.guide.flatMap((s) => s.entries?.filter((e) => e.mini) ?? []);

  return (
    <div {...data} data-dl="youtube-site" data-screen={screen} data-guide={toggled ? 'toggled' : undefined}>
      <header data-dl-part="masthead">
        <div data-dl-part="start">{start}</div>
        <form data-dl-part="center" role="search" onSubmit={(e) => e.preventDefault()}>
          <div data-dl-part="search">
            <TextField label={c.search} hideLabel type="search" placeholder={c.search} value={query} onChange={setQuery} action={{ label: c.search, icon: 'search', iconOnly: true, onAction: () => undefined }} />
          </div>
          <span data-dl-part="voice"><Button label={c.voiceSearch} icon="mic" iconOnly /></span>
        </form>
        <div data-dl-part="end">
          <Button label={c.settings} icon="more-vertical" iconOnly emphasis="quiet" />
          <Button label={c.signIn} icon="person" tone="link" />
        </div>
      </header>
      <nav data-dl-part="mini" aria-label={c.guide}>
        {mini.map((e) => (
          <a key={e.label} data-dl-part="entry" href={`#${e.label.toLowerCase().replace(/\s+/g, '-')}`} aria-current={e.current ? 'page' : undefined}>
            <Icon name={e.icon as IconName} />
            <span>{e.label}</span>
          </a>
        ))}
      </nav>
      <div data-dl-part="scrim" aria-hidden="true" onClick={() => setToggled(false)} />
      <nav data-dl-part="guide" aria-label={c.guide}>
        <div data-dl-part="head">{start}</div>
        <ScrollArea label={c.guide}>
          <div data-dl="youtube-guide">
            {view.guide.map((s) => (
              <section key={s.id} data-dl-part="section" aria-label={s.title}>
                {s.title && <div data-dl-part="section-title"><Heading level={2} size={4}>{s.title}</Heading></div>}
                {s.prompt && (
                  <div data-dl-part="prompt">
                    <p>{s.prompt}</p>
                    <Button label={c.signIn} icon="person" tone="link" />
                  </div>
                )}
                {s.entries?.map((e) => (
                  <a key={e.label} data-dl-part="entry" href={`#${e.label.toLowerCase().replace(/\s+/g, '-')}`} aria-current={e.current ? 'page' : undefined}>
                    <Icon name={e.icon as IconName} />
                    <span>{e.label}</span>
                  </a>
                ))}
              </section>
            ))}
          </div>
        </ScrollArea>
      </nav>
      <main data-dl-part="main">
        <ScrollArea label={c.feed}>
          <div data-dl="youtube-feed">
            <div data-dl-part="chips">
              <ChipGroup label={c.filters} hideLabel selection="single" value={chip} onChange={(v) => setChip(v.length ? v : chip)} chips={view.chips.map((label) => ({ id: label, label }))} />
            </div>
            <ul data-dl-part="grid" aria-label={c.feed}>
              {view.videos.map((v) => <li key={v.id}><VideoCard video={v} copy={c} /></li>)}
            </ul>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

function VideoCard({ video, copy: c }: { video: YoutubeVideo; copy: Record<string, string> }) {
  return (
    <article data-dl="youtube-video">
      <a data-dl-part="frame" href={`#${video.id}`} aria-label={video.title}>
        <span data-dl-part="duration"><Badge size="s" tone="neutral" emphasis="media">{video.duration}</Badge></span>
      </a>
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
