// ─── MovieBox Provider for vega-app ────────────────────────────────────────
// Ported from phisher98 & upgraded with official MovieBox H5 API
// Provides high-speed streaming for movies and Hindi series.

import { Catalog, Info, Link, Post, ProviderContext, ProviderType, Stream } from '../types';
import { commonHeaders } from '../headers';
import { getBaseUrl } from '../getBaseUrl';

export const catalog: Catalog[] = [
  { title: 'Trending', filter: '/wefeed-h5api-bff/subject/trending' },
  { title: 'Movies', filter: '/wefeed-h5api-bff/subject/trending?tabId=ONEROOM_MOVIE' },
  { title: 'TV Series', filter: '/wefeed-h5api-bff/subject/trending?tabId=ONEROOM_TV' },
];

const requestHeaders = {
  ...commonHeaders,
  Accept: 'application/json',
  'x-client-info': JSON.stringify({ timezone: 'Asia/Colombo' }),
};

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
  const baseUrl = (await getBaseUrl('movieBoxWeb')) || 'https://officialmoviebox.com';
  const sep = filter.includes('?') ? '&' : '?';
  const url = `${baseUrl}${filter}${sep}page=${page}&perPage=20`;

  const res = await axios.get(url, { headers: requestHeaders, signal });
  const list: any[] = res.data?.data?.subjectList || [];

  return list.map((item: any): Post => ({
    title: item.title?.replace(/\s*\[.*?\]\s*$/, '') || item.title || '',
    link: `${baseUrl}/moviesDetail/${item.detailPath}`,
    image: item.cover?.url || '',
    provider: 'movieBox',
    tag: item.releaseDate || undefined,
  }));
}

export async function getSearchPosts({
  searchQuery,
  page: _page,
  signal,
  providerContext,
}: {
  searchQuery: string;
  page: number;
  providerValue: string;
  providerContext: ProviderContext;
  signal: AbortSignal;
}): Promise<Post[]> {
  const { axios, cheerio } = providerContext;
  const baseUrl = (await getBaseUrl('movieBoxWeb')) || 'https://officialmoviebox.com';
  const url = `${baseUrl}/newWeb/searchResult?keyword=${encodeURIComponent(searchQuery)}`;

  const res = await axios.get(url, { headers: commonHeaders, signal });
  const $ = cheerio.load(res.data as string);
  const posts: Post[] = [];

  $('a[href*="/moviesDetail/"]').each((_: number, el: any) => {
    const card = $(el);
    const href = card.attr('href') || '';
    const title = card.find('h2, h3').first().text().trim() || card.find('img').attr('alt') || card.attr('title') || '';
    const img = card.find('img').attr('src') || card.find('img').attr('data-src') || '';

    if (title && href) {
      posts.push({
        title,
        link: href.startsWith('http') ? href : `${baseUrl}${href}`,
        image: img,
        provider: 'movieBox',
      });
    }
  });

  return posts;
}

export async function getMeta({
  link,
  signal,
  providerContext,
}: {
  link: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Info> {
  const { axios, cheerio } = providerContext;
  const res = await axios.get(link, { headers: commonHeaders, signal });
  const $ = cheerio.load(res.data as string);

  const title = $('h1').first().text().trim() || $('meta[property="og:title"]').attr('content') || '';
  const image = $('meta[property="og:image"]').attr('content') || '';
  const synopsis = $('meta[name="description"]').attr('content') || '';
  const type = link.toLowerCase().includes('tv') ? 'series' : 'movie';

  // Extract direct MP4 / HLS streams embedded in the Nuxt hydration state
  const streams: string[] = [];
  try {
    const nuxtRaw = $('#__NUXT_DATA__').text();
    if (nuxtRaw) {
      const nuxtData = JSON.parse(nuxtRaw);
      for (const item of nuxtData) {
        if (typeof item === 'string' && (item.endsWith('.mp4') || item.includes('.m3u8')) && item.startsWith('http')) {
          if (!streams.includes(item)) streams.push(item);
        }
      }
    }
  } catch { /* skip */ }

  const directLinks = streams.map((s, idx) => ({
    title: `Stream Server ${idx + 1}`,
    link: s,
    type: type === 'movie' ? ('movie' as const) : ('series' as const),
  }));

  if (!directLinks.length) {
    directLinks.push({
      title: 'Watch Online',
      link,
      type: type === 'movie' ? ('movie' as const) : ('series' as const),
    });
  }

  return {
    title,
    image,
    synopsis,
    type,
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

  if (link.startsWith('http') && (link.includes('.mp4') || link.includes('.m3u8'))) {
    streams.push({
      server: 'MovieBox Fast CDN',
      link,
      type: link.includes('.m3u8') ? 'm3u8' : 'mp4',
      headers: {
        Referer: 'https://officialmoviebox.com/',
        Origin: 'https://officialmoviebox.com',
      },
    });
  } else {
    streams.push({
      server: 'MovieBox Stream',
      link,
      type: 'm3u8',
    });
  }

  return streams;
}

export const MovieBoxProvider: ProviderType = {
  catalog,
  genres: [],
  searchFilter: 'keyword',
  GetHomePage: getPosts,
  GetSearchPosts: getSearchPosts,
  GetInfo: getMeta,
  GetStream: getStream,
};
