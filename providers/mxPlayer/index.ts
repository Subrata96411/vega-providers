// ─── MXPlayer / M Player Provider for vega-app ─────────────────────────────
// Ported from phisher98/cloudstream-extensions-phisher MPlayerProvider ext.
//
// Uses the official MX Player (mxplayer.in) public API.
// Delivers direct HLS (.m3u8) streams from CloudFront.

import { Catalog, Info, Link, Post, ProviderContext, ProviderType, Stream } from '../types';
import { commonHeaders } from '../headers';

export const catalog: Catalog[] = [
  { title: 'Hindi Movies',     filter: 'hindi_movies' },
  { title: 'Hindi Web Series', filter: 'hindi_web_series' },
  { title: 'Drama',            filter: 'drama' },
  { title: 'Crime',            filter: 'crime' },
  { title: 'Thriller',         filter: 'thriller' },
  { title: 'Action',           filter: 'action' },
];

const WEB_API   = 'https://api.mxplayer.in/v1/web';
const IMAGE_CDN = 'https://qqcdnpictest.mxplay.com';
const MAIN_URL  = 'https://www.mxplayer.in';

const GENRE_IDS: Record<string, string> = {
  drama:    'b413dff55bdad743c577a8bea3b65044',
  crime:    '48efa872f6f17facebf6149dfc536ee1',
  thriller: '48efa872f6f17facebf6149dfc536ee1',
  action:   '7fa3e873a6e48291f69e9fae2a7c1f38',
};

const FILTER_TYPE: Record<string, { type: number }> = {
  hindi_movies:     { type: 1 }, // Type 1 = Movies with direct streams
  hindi_web_series: { type: 2 },
};

let _userId: string | null = null;

function getEndParam(userId: string | null): string {
  return `&device-density=2&userid=${userId || ''}&platform=com.mxplay.desktop&content-languages=hi,en&kids-mode-enabled=false`;
}

async function ensureUserId(axios: any): Promise<string | null> {
  if (_userId) return _userId;
  try {
    const res = await axios.get(MAIN_URL, { headers: commonHeaders });
    const cookies: string = res.headers?.['set-cookie']?.join(';') || '';
    const match = cookies.match(/UserID=([^;]+)/);
    _userId = match?.[1] ?? null;
  } catch { _userId = null; }
  return _userId;
}

function buildImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${IMAGE_CDN}${path}`;
}

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
  const userId = await ensureUserId(axios);
  const genreId = GENRE_IDS[filter];
  const typeInfo = FILTER_TYPE[filter];
  const type = typeInfo?.type ?? 1;

  const url = `${WEB_API}/detail/browseItem?&pageNum=${page}&pageSize=20&isCustomized=true${genreId ? `&genreFilterIds=${genreId}` : ''}&type=${type}${getEndParam(userId)}`;

  const res = await axios.get(url, {
    headers: { ...commonHeaders, Referer: `${MAIN_URL}/` },
    signal,
  });

  const items: any[] = res.data?.items ?? [];
  return items.map((item: any): Post => {
    // Check if stream URLs exist directly inside the item
    const hls = item.stream?.thirdParty?.hlsUrl || item.stream?.hls?.high || item.stream?.hls?.base;
    const itemType = item.type === 'movie' ? 'movie' : 'series';

    return {
      title: item.title || item.name || '',
      link: JSON.stringify({
        id: item.id,
        type: itemType,
        title: item.title,
        hls: hls || null,
        shareUrl: item.shareUrl,
      }),
      image: buildImageUrl(item.imageInfo?.find((x: any) => x.type === 'portrait_large')?.url || item.thumbnailUrl || ''),
      provider: 'mxPlayer',
      tag: itemType === 'movie' ? 'Movie' : 'Series',
      cornerTag: item.languages?.[0] || undefined,
    };
  });
}

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
  const userId = await ensureUserId(axios);

  const url = `${WEB_API}/search/result?query=${encodeURIComponent(searchQuery)}&pageNum=${page}&pageSize=20${getEndParam(userId)}`;

  const res = await axios.get(url, {
    headers: { ...commonHeaders, Referer: `${MAIN_URL}/` },
    signal,
  });

  const posts: Post[] = [];
  const sections: any[] = res.data?.sections || [];

  for (const sec of sections) {
    const items: any[] = sec.items || [];
    for (const item of items) {
      if (!item?.id || !item?.title) continue;
      const hls = item.stream?.thirdParty?.hlsUrl || item.stream?.hls?.high || item.stream?.hls?.base;
      const itemType = item.type === 'movie' ? 'movie' : 'series';

      posts.push({
        title: item.title || '',
        link: JSON.stringify({
          id: item.id,
          type: itemType,
          title: item.title,
          hls: hls || null,
          shareUrl: item.shareUrl,
        }),
        image: buildImageUrl(item.imageInfo?.find((x: any) => x.type === 'portrait_large')?.url || item.thumbnailUrl || ''),
        provider: 'mxPlayer',
        tag: sec.name || undefined,
      });
    }
  }

  return posts;
}

export async function getMeta({
  link,
  signal: _signal,
  providerContext: _providerContext,
}: {
  link: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Info> {
  let parsed: any = {};
  try {
    parsed = JSON.parse(link);
  } catch {
    parsed = { id: link, type: 'movie', title: 'Video' };
  }

  const directLinks = [];
  if (parsed.hls) {
    directLinks.push({
      title: 'Play Movie (HLS)',
      link: parsed.hls,
      type: 'movie' as const,
    });
  } else {
    directLinks.push({
      title: 'Play Stream',
      link: `https://d3sgzbosmwirao.cloudfront.net/video/${parsed.id}/2/hls/h264_high.m3u8`,
      type: 'movie' as const,
    });
  }

  return {
    title: parsed.title || 'MX Player',
    image: '',
    synopsis: '',
    type: parsed.type || 'movie',
    linkList: [
      {
        title: 'Watch',
        directLinks,
      },
    ],
  };
}

export async function getStream({
  link,
}: {
  link: string;
  type: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
  isDownload?: boolean;
}): Promise<Stream[]> {
  const streams: Stream[] = [];
  const streamUrl = link.startsWith('http') ? link : `https://d3sgzbosmwirao.cloudfront.net/${link}`;

  streams.push({
    server: 'MX Player CloudFront HLS',
    link: streamUrl,
    type: 'm3u8',
    headers: {
      Referer: 'https://www.mxplayer.in/',
      Origin: 'https://www.mxplayer.in',
    },
  });

  return streams;
}

export const MXPlayerProvider: ProviderType = {
  catalog,
  genres: catalog.slice(2),
  searchFilter: 'query',
  GetHomePage: getPosts,
  GetSearchPosts: getSearchPosts,
  GetInfo: getMeta,
  GetStream: getStream,
};
