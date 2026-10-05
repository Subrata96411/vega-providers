// ─── Vega Provider Types ────────────────────────────────────────────────
// Mirrors the interface expected by vega-app. Keep this in sync with
// the upstream types at vega-org/vega-app src/lib/providers/types.ts

export interface Post {
  title: string;
  link: string;
  image: string;
  provider?: string;
  aspectRatio?: number | string;
  borderRadius?: number;
  tag?: string;
  cornerTag?: string;
}

export interface SkipInterval {
  title?: string;
  from: number;
  to: number;
}

export type TextTrackType =
  | 'application/x-subrip'
  | 'application/ttml+xml'
  | 'text/vtt';

export type TextTracks = {
  title: string;
  language: string;
  type: TextTrackType;
  uri: string;
}[];

export interface Stream {
  server: string;
  link: string;
  type: string;
  quality?: '360' | '480' | '720' | '1080' | '2160' | string;
  tag?: string;
  tags?: string[];
  subtitles?: TextTracks;
  headers?: Record<string, string>;
  skip?: SkipInterval[];
}

export interface EpisodeLink {
  id?: string;
  title: string;
  link: string;
  sourceLink?: string;
  description?: string;
  image?: string;
  quickDownload?: boolean;
  skip?: SkipInterval[];
}

export interface Link {
  title: string;
  quality?: string;
  episodesLink?: string;
  quickDownload?: boolean;
  directLinks?: {
    title: string;
    link: string;
    type?: 'movie' | 'series';
    description?: string;
    image?: string;
    quickDownload?: boolean;
    skip?: SkipInterval[];
  }[];
}

export interface Info {
  title: string;
  image: string;
  logo?: string;
  poster?: string;
  synopsis: string;
  imdbId?: string;
  tmdbId?: number | string;
  type: string;
  quickDownload?: boolean;
  populateMeta?: boolean;
  webUrl?: string;
  tags?: string[];
  cast?: string[];
  rating?: string;
  trailerUrl?: string;
  linkList: Link[];
}

export interface Catalog {
  title: string;
  filter: string;
}

export interface ProviderContext {
  axios: any;
  cheerio: any;
  commonHeaders: Record<string, string>;
  openWebView?: (url: string) => Promise<string | null>;
}

export interface ProviderType {
  searchFilter?: string;
  catalog: Catalog[];
  genres: Catalog[];
  blurImage?: boolean;
  nonStreamableServer?: string[];
  nonDownloadableServer?: string[];
  GetStream: (params: {
    link: string;
    type: string;
    signal: AbortSignal;
    providerContext: ProviderContext;
    isDownload?: boolean;
  }) => Promise<Stream[]>;
  GetInfo: (params: {
    link: string;
    signal: AbortSignal;
    providerContext: ProviderContext;
  }) => Promise<Info>;
  GetHomePage: (params: {
    filter: string;
    page: number;
    providerValue: string;
    providerContext: ProviderContext;
    signal: AbortSignal;
  }) => Promise<Post[]>;
  GetSearchPosts: (params: {
    searchQuery: string;
    page: number;
    providerValue: string;
    providerContext: ProviderContext;
    signal: AbortSignal;
  }) => Promise<Post[]>;
}
