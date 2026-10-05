// ─── AnimePahe Provider for vega-app ──────────────────────────────────────
// Ported from phisher98/cloudstream-extensions-phisher AnimePahe ext.
//
// AnimePahe provides lightweight anime releases with multiple resolutions.
// API: /api?m=airing, /api?m=search, /api?m=release

import { Catalog, Info, Link, Post, ProviderContext, ProviderType, Stream } from '../types';
import { commonHeaders } from '../headers';

export const catalog: Catalog[] = [
  { title: 'Latest Airing', filter: 'airing' },
  { title: 'Popular',       filter: 'popular' },
  { title: 'Completed',     filter: 'completed' },
];

const BASE_URL = 'https://animepahe.pw';

const AP_HEADERS = {
  ...commonHeaders,
  Referer: `${BASE_URL}/`,
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
  const url = `${BASE_URL}/api?m=airing&page=${page}`;

  const res = await axios.get(url, { headers: AP_HEADERS, signal });
  const list: any[] = res.data?.data ?? [];

  return list.map((item: any): Post => ({
    title: item.anime_title || item.title || '',
    link: `animepahe://${item.anime_session || item.session}`,
    image: item.snapshot || '',
    provider: 'animePahe',
    tag: `Ep ${item.episode}`,
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
  const { axios } = providerContext;
  const url = `${BASE_URL}/api?m=search&l=12&q=${encodeURIComponent(searchQuery)}`;

  const res = await axios.get(url, { headers: AP_HEADERS, signal });
  const list: any[] = res.data?.data ?? [];

  return list.map((item: any): Post => ({
    title: item.title || '',
    link: `animepahe://${item.session}`,
    image: item.poster || '',
    provider: 'animePahe',
    tag: item.type || undefined,
    cornerTag: item.status || undefined,
  }));
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
  const session = link.replace('animepahe://', '');

  // Fetch anime page HTML
  const pageUrl = `${BASE_URL}/anime/${session}`;
  const res = await axios.get(pageUrl, { headers: AP_HEADERS, signal });
  const $ = cheerio.load(res.data as string);

  const title = $('div.title-wrapper h1 span').text().trim() || $('h1').text().trim();
  const image = $('div.anime-poster a').attr('href') || $('img.poster-image').attr('src') || '';
  const synopsis = $('div.anime-summary').text().trim();
  const type = $('div.anime-info').text().includes('Movie') ? 'movie' : 'series';

  // Get episodes from release API
  const epRes = await axios.get(`${BASE_URL}/api?m=release&id=${session}&sort=episode_asc&page=1`, {
    headers: AP_HEADERS,
    signal,
  });

  const epList: any[] = epRes.data?.data ?? [];
  const linkList: Link[] = [];

  const directLinks: Link['directLinks'] = epList.map((ep: any) => ({
    title: `Episode ${ep.episode}`,
    link: `animepahe-play://${session}::${ep.session}::${ep.episode}`,
    type: type === 'movie' ? 'movie' : 'series',
  }));

  linkList.push({
    title: 'Episodes',
    directLinks,
  });

  return {
    title,
    image,
    synopsis,
    type,
    linkList,
  };
}

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
  const { axios, cheerio } = providerContext;
  const streams: Stream[] = [];

  // format: animepahe-play://<animeSession>::<epSession>::<epNum>
  const parts = link.replace('animepahe-play://', '').split('::');
  const animeSession = parts[0];
  const epSession = parts[1];

  const playUrl = `${BASE_URL}/play/${animeSession}/${epSession}`;
  const res = await axios.get(playUrl, { headers: AP_HEADERS, signal });
  const $ = cheerio.load(res.data as string);

  // Kwik links inside download button / player buttons
  $('#pickDownload a, #resolutionMenu button').each((_: number, el: any) => {
    const kwikUrl = $(el).attr('href') || $(el).attr('data-src') || '';
    const label = $(el).text().trim();
    if (kwikUrl && kwikUrl.includes('kwik')) {
      streams.push({
        server: `Kwik (${label})`,
        link: kwikUrl,
        type: 'm3u8',
        quality: label.includes('1080p') ? '1080' : label.includes('720p') ? '720' : '480',
      });
    }
  });

  return streams;
}

export const AnimePaheProvider: ProviderType = {
  catalog,
  genres: [],
  searchFilter: 'q',
  GetHomePage: getPosts,
  GetSearchPosts: getSearchPosts,
  GetInfo: getMeta,
  GetStream: getStream,
};
