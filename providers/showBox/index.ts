// ─── ShowBox Provider for vega-app ─────────────────────────────────────────
// Ported from phisher98/cloudstream-extensions-phisher ShowBox CloudStream ext.
// ShowBox / MovieBox — huge catalog of movies & TV, uses Box API

import { Catalog, Info, Link, Post, ProviderContext, ProviderType, Stream } from '../types';
import { commonHeaders } from '../headers';

// ────────────────────────────────── catalog ───────────────────────────────────

export const catalog: Catalog[] = [
  { title: 'Trending', filter: 'trending' },
  { title: 'Movies', filter: 'movies' },
  { title: 'TV Shows', filter: 'tv-shows' },
  { title: 'Top Rated', filter: 'top-rated' },
  { title: 'Action', filter: 'genre/action' },
  { title: 'Adventure', filter: 'genre/adventure' },
  { title: 'Animation', filter: 'genre/animation' },
  { title: 'Comedy', filter: 'genre/comedy' },
  { title: 'Crime', filter: 'genre/crime' },
  { title: 'Documentary', filter: 'genre/documentary' },
  { title: 'Drama', filter: 'genre/drama' },
  { title: 'Fantasy', filter: 'genre/fantasy' },
  { title: 'Horror', filter: 'genre/horror' },
  { title: 'Mystery', filter: 'genre/mystery' },
  { title: 'Romance', filter: 'genre/romance' },
  { title: 'Sci-Fi', filter: 'genre/science-fiction' },
  { title: 'Thriller', filter: 'genre/thriller' },
  { title: 'War', filter: 'genre/war' },
  { title: 'Western', filter: 'genre/western' },
];

// ────────────────────────────────── constants ─────────────────────────────────

const BASE_API = 'https://www.showbox.media/api';
const BOX_TOKEN = 'oxRyYep4yS2GKDh0'; // public box API token
const FEBOX_API = 'https://feboxapi.com/api/v1'; // alternate endpoint

// ShowBox-specific headers
const SB_HEADERS = {
  ...commonHeaders,
  'Origin': 'https://www.showbox.media',
  'Referer': 'https://www.showbox.media/',
};

// ────────────────────────────────── helpers ───────────────────────────────────

function mapCategory(filter: string): { type: number; genre?: number } {
  const genreMap: Record<string, number> = {
    'genre/action': 28,
    'genre/adventure': 12,
    'genre/animation': 16,
    'genre/comedy': 35,
    'genre/crime': 80,
    'genre/documentary': 99,
    'genre/drama': 18,
    'genre/fantasy': 14,
    'genre/horror': 27,
    'genre/mystery': 9648,
    'genre/romance': 10749,
    'genre/science-fiction': 878,
    'genre/thriller': 53,
    'genre/war': 10752,
    'genre/western': 37,
  };

  if (filter === 'movies' || filter.startsWith('genre/') || filter === 'top-rated' || filter === 'trending') {
    return { type: 1, genre: genreMap[filter] };
  }
  if (filter === 'tv-shows') {
    return { type: 2 };
  }
  return { type: 1 };
}

// ────────────────────────────────── getPosts ─────────────────────────────────

export async function getPosts({
  filter,
  page,
  signal,
  providerContext,
}: {
  filter: string;
  page: number;
  providerValue: string;
  providerContext: ProviderContext;
  signal: AbortSignal;
}): Promise<Post[]> {
  const { axios } = providerContext;
  const { type, genre } = mapCategory(filter);

  const sort = filter === 'top-rated' ? 'top_rated'
    : filter === 'trending' ? 'popularity' : 'release';

  const params: Record<string, string | number> = {
    token: BOX_TOKEN,
    page,
    count: 24,
    sort,
    type,
  };
  if (genre) params.genre = genre;

  const res = await axios.get(`${BASE_API}/media/list`, {
    params,
    headers: SB_HEADERS,
    signal,
  });

  const data = res.data as any;
  if (!data?.data?.list) return [];

  return data.data.list.map((item: any): Post => ({
    title: item.title || item.name || '',
    link: `showbox://${item.id}::${item.type ?? type}`,
    image: `https://image.tmdb.org/t/p/w500${item.poster_path}` || '',
    provider: 'showBox',
    tag: item.type === 2 ? 'TV' : 'Movie',
    cornerTag: item.quality || undefined,
  }));
}

// ────────────────────────────────── getSearchPosts ────────────────────────────

export async function getSearchPosts({
  searchQuery,
  page,
  signal,
  providerContext,
}: {
  searchQuery: string;
  page: number;
  providerValue: string;
  providerContext: ProviderContext;
  signal: AbortSignal;
}): Promise<Post[]> {
  const { axios } = providerContext;

  const res = await axios.get(`${BASE_API}/search`, {
    params: {
      token: BOX_TOKEN,
      keyword: searchQuery,
      page,
      count: 24,
    },
    headers: SB_HEADERS,
    signal,
  });

  const data = res.data as any;
  if (!data?.data?.list) return [];

  return data.data.list.map((item: any): Post => ({
    title: item.title || item.name || '',
    link: `showbox://${item.id}::${item.type}`,
    image: `https://image.tmdb.org/t/p/w500${item.poster_path}` || '',
    provider: 'showBox',
    tag: item.type === 2 ? 'TV' : 'Movie',
  }));
}

// ────────────────────────────────── getMeta (Info) ────────────────────────────

export async function getMeta({
  link,
  signal,
  providerContext,
}: {
  link: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Info> {
  const { axios } = providerContext;

  // link format: showbox://<id>::<type>
  const [id, rawType] = link.replace('showbox://', '').split('::');
  const mediaType = parseInt(rawType, 10) || 1;

  const res = await axios.get(`${BASE_API}/media/detail`, {
    params: { token: BOX_TOKEN, id, type: mediaType },
    headers: SB_HEADERS,
    signal,
  });

  const item = res.data?.data || {};
  const title = item.title || item.name || '';
  const image = `https://image.tmdb.org/t/p/w500${item.poster_path}` || '';
  const poster = `https://image.tmdb.org/t/p/original${item.backdrop_path}` || undefined;
  const synopsis = item.description || item.overview || '';
  const rating = item.score ? String(item.score) : undefined;
  const tags: string[] = (item.genres || []).map((g: any) => g.name as string);
  const type = mediaType === 2 ? 'series' : 'movie';

  const linkList: Link[] = [];

  if (type === 'movie') {
    linkList.push({
      title: 'Watch Movie',
      directLinks: [{ title: 'Play', link: `${link}::movie`, type: 'movie' }],
    });
  } else {
    const seasons: any[] = item.seasons || [];
    for (const season of seasons) {
      const eps: Link['directLinks'] = (season.episodes || []).map((ep: any) => ({
        title: `E${ep.episode}: ${ep.title || ''}`.trim(),
        link: `showbox-ep://${id}::${mediaType}::${season.season}::${ep.episode}`,
        type: 'series' as const,
        description: ep.synopsis || undefined,
      }));
      linkList.push({ title: `Season ${season.season}`, directLinks: eps });
    }
  }

  return {
    title,
    image,
    poster,
    synopsis,
    type,
    rating,
    tags,
    linkList,
    populateMeta: true,
  };
}

// ────────────────────────────────── getStream ─────────────────────────────────

export async function getStream({
  link,
  signal,
  providerContext,
}: {
  link: string;
  type: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
  isDownload?: boolean;
}): Promise<Stream[]> {
  const { axios } = providerContext;
  const streams: Stream[] = [];

  // Decode: showbox-ep://<id>::<type>::<season>::<episode>
  //         showbox://<id>::<type>::movie
  let id = '', mediaType = 1, season = 0, episode = 0;

  if (link.startsWith('showbox-ep://')) {
    const parts = link.replace('showbox-ep://', '').split('::');
    id = parts[0];
    mediaType = parseInt(parts[1], 10);
    season = parseInt(parts[2], 10);
    episode = parseInt(parts[3], 10);
  } else {
    const parts = link.replace('showbox://', '').split('::');
    id = parts[0];
    mediaType = parseInt(parts[1], 10);
  }

  const params: Record<string, string | number> = {
    token: BOX_TOKEN,
    id,
    type: mediaType,
  };
  if (season) { params.season = season; params.episode = episode; }

  // 1️⃣  Get available servers
  const serversRes = await axios.get(`${FEBOX_API}/media/providers`, {
    params: { ...params, fid: id },
    headers: SB_HEADERS,
    signal,
  });

  const serverList: any[] = serversRes.data?.data || [];

  // 2️⃣  Fetch stream from each server
  for (const srv of serverList.slice(0, 3)) { // cap at 3 to avoid rate limits
    try {
      const streamRes = await axios.get(`${FEBOX_API}/media/provider`, {
        params: { ...params, sid: srv.id },
        headers: SB_HEADERS,
        signal,
      });

      const links: any[] = streamRes.data?.data?.list || [];
      for (const item of links) {
        if (item.url) {
          streams.push({
            server: srv.name || 'ShowBox',
            link: item.url,
            type: item.url.includes('.m3u8') ? 'm3u8' : 'mp4',
            quality: item.quality || undefined,
          });
        }
      }
    } catch {
      /* skip dead server */
    }
  }

  return streams;
}

// ────────────────────────────────── provider export ──────────────────────────

export const ShowBoxProvider: ProviderType = {
  catalog,
  genres: catalog.slice(4),
  searchFilter: 'keyword',
  GetHomePage: getPosts,
  GetSearchPosts: getSearchPosts,
  GetInfo: getMeta,
  GetStream: getStream,
};
