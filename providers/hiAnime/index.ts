// ─── HiAnime Provider for vega-app ─────────────────────────────────────────
// Ported from phisher98/cloudstream-extensions-phisher HiAnime CloudStream ext.
// Uses HiAnime with reliable live domain mirrors.

import { Catalog, Info, Link, Post, ProviderContext, ProviderType, Stream } from '../types';
import { commonHeaders } from '../headers';

export const catalog: Catalog[] = [
  { title: 'Top Airing', filter: 'top-airing' },
  { title: 'Most Popular', filter: 'most-popular' },
  { title: 'Most Favorite', filter: 'most-favorite' },
  { title: 'Latest Completed', filter: 'completed' },
];

const DOMAINS = ['https://hianime.to', 'https://aniwatchtv.to', 'https://hianime.nz'];

async function getLiveBase(axios: any, signal?: AbortSignal): Promise<string> {
  for (const d of DOMAINS) {
    try {
      const res = await axios.get(d, {
        headers: commonHeaders,
        timeout: 4000,
        signal,
      });
      if (res.status === 200) return d;
    } catch { /* try next mirror */ }
  }
  return DOMAINS[0];
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
  const { axios, cheerio } = providerContext;
  const baseUrl = await getLiveBase(axios, signal);
  const url = `${baseUrl}/${filter}?page=${page}`;

  const res = await axios.get(url, { headers: commonHeaders, signal });
  const $ = cheerio.load(res.data as string);
  const posts: Post[] = [];

  $('div.film_list-wrap div.flw-item').each((_: number, el: any) => {
    const $el = $(el);
    const anchor = $el.find('a.film-poster-ahref').first();
    const link = anchor.attr('href') || '';
    const title = $el.find('h3.film-name a').text().trim() || $el.find('.film-name').text().trim();
    const image = $el.find('img.film-poster-img').attr('data-src') || $el.find('img').attr('src') || '';
    const tag = $el.find('.tick-sub').text().trim() || undefined;

    if (link && title) {
      posts.push({
        title,
        link: link.startsWith('http') ? link : `${baseUrl}${link}`,
        image,
        provider: 'hiAnime',
        tag,
      });
    }
  });

  return posts;
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
  const { axios, cheerio } = providerContext;
  const baseUrl = await getLiveBase(axios, signal);
  const url = `${baseUrl}/search?keyword=${encodeURIComponent(searchQuery)}&page=${page}`;

  const res = await axios.get(url, { headers: commonHeaders, signal });
  const $ = cheerio.load(res.data as string);
  const posts: Post[] = [];

  $('div.film_list-wrap div.flw-item').each((_: number, el: any) => {
    const $el = $(el);
    const anchor = $el.find('a.film-poster-ahref').first();
    const link = anchor.attr('href') || '';
    const title = $el.find('h3.film-name a').text().trim() || '';
    const image = $el.find('img.film-poster-img').attr('data-src') || $el.find('img').attr('src') || '';

    if (link && title) {
      posts.push({
        title,
        link: link.startsWith('http') ? link : `${baseUrl}${link}`,
        image,
        provider: 'hiAnime',
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

  const title = $('h2.film-name').text().trim() || $('h1').text().trim();
  const image = $('div.film-poster img').attr('src') || '';
  const synopsis = $('div.film-description .text').text().trim();
  const type = link.includes('/movie') ? 'movie' : 'series';

  return {
    title,
    image,
    synopsis,
    type,
    linkList: [
      {
        title: 'Watch',
        directLinks: [{ title: 'Stream', link, type: type === 'movie' ? 'movie' : 'series' }],
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
  return [
    {
      server: 'HiAnime Stream',
      link,
      type: 'm3u8',
    },
  ];
}

export const HiAnimeProvider: ProviderType = {
  catalog,
  genres: [],
  searchFilter: 'keyword',
  GetHomePage: getPosts,
  GetSearchPosts: getSearchPosts,
  GetInfo: getMeta,
  GetStream: getStream,
};
