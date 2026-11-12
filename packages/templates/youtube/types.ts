/** One guide destination: a core icon and its label. */
export interface YoutubeGuideEntry {
  label: string;
  /** A core icon name. */
  icon: string;
  /** The page being shown. */
  current?: boolean;
  /** Also shown in the mini guide (the 72 wide column of icons over short labels). */
  mini?: boolean;
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
/** One comment under the video being watched. */
export interface YoutubeComment {
  author: string;
  age: string;
  text: string;
  /** Like count as shown ("1.2K"). */
  likes: string;
}
/** The video being watched: one of `videos`, with what the watch page adds around it. */
export interface YoutubeWatch {
  /** The `id` of the video in `videos`. */
  video: string;
  subscribers: string;
  /** Like count as shown on the like button ("12K"). */
  likes: string;
  /** The description's first line: views and date ("412,309 views  3 days ago"). */
  stats: string;
  description: string;
  /** "N Comments". */
  commentCount: string;
  comments: YoutubeComment[];
}export interface YoutubeRecord {
  /** The neutral wordmark beside the guide button: never a product logo. */
  wordmark: string;
  guide: YoutubeGuideSection[];
  /** Feed filters; the first is selected. */
  chips: string[];
  videos: YoutubeVideo[];
  /** The watch page: the video being watched; up next is every other video. */
  watch: YoutubeWatch;
  copy: Record<string, string>;
}
