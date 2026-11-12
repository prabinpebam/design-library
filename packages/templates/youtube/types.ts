/** One guide destination: a core icon and its label. */
export interface YoutubeGuideEntry {
  label: string;
  /** A core icon name. */
  icon: string;
  /** The page being shown. */
  current?: boolean;
}
/** A guide section: an optional heading over its destinations, or a short signed-out prompt with a sign-in action. */
export interface YoutubeGuideSection {
  id: string;
  title?: string;
  entries?: YoutubeGuideEntry[];
  /** A signed-out prompt shown instead of destinations. */
  prompt?: string;
}
/** One video in the feed. Pictures are neutral frames; every title and channel is original. */
export interface YoutubeVideo {
  id: string;
  title: string;
  channel: string;
  views: string;
  age: string;
  /** Length shown on the frame ("12:04"). */
  duration: string;
}
export interface YoutubeRecord {
  /** The neutral wordmark beside the guide button: never a product logo. */
  wordmark: string;
  guide: YoutubeGuideSection[];
  /** Feed filters; the first is selected. */
  chips: string[];
  videos: YoutubeVideo[];
  copy: Record<string, string>;
}
