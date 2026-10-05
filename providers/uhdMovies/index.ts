// ─── UHDmovies Provider for vega-app ──────────────────────────────────────
// Ported from phisher98/cloudstream-extensions-phisher UHDmoviesProvider ext.
//
// UHDmovies: 4K/1080p Hollywood, Bollywood, Dual Audio & Hindi Dubbed releases.

import { Catalog, Info, Link, Post, ProviderContext, ProviderType, Stream } from '../types';
import { commonHeaders } from '../headers';
import { getBaseUrl } from '../getBaseUrl';

export const catalog: Catalog[] = [
  { title: 'Latest', filter: '' },
  { title: '4K Ultra HD', filter: 'category/4k-ultra-hd' },
  { title: 'Bollywood', filter: 'category/bollywood' },
  { title: 'Hollywood', filter: 'category/hollywood-movies' },
  { title: 'Web Series', filter: 'category/web-series' },
  { title: 'Hindi Dubbed', filter: 'category/hindi-dubbed-movies' },
];

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
  const baseUrl = (await getBaseUrl('UhdMovies')) || 'https://uhdmovies.my';
  const path = filter ? `${filter}/page/${page}/` : `page/${page}/`;
  const url = `${baseUrl}/${path}`;

  const res = await axios.get(url, {
    headers: { ...commonHeaders, Referer: `${baseUrl}/` },
    signal,
  });
  const $ = cheerio.load(res.data as string);
  const posts: Post[] = [];

  $('article.gridlove-post, article.post, div.post-item').each((_: number, el: any) => {
    // Title is inside a[title] or h1.sanket or .entry-title
    const anchor = $(el).find('a[title]').first();
    const title = anchor.attr('title') || $(el).find('h1.sanket, .entry-title').text().trim();
    const link = anchor.attr('href') || '';
    const image = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';

    if (title && link) {
      posts.push({
        title,
        link,
        image,
        provider: 'uhdMovies',
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
  const baseUrl = (await getBaseUrl('UhdMovies')) || 'https://uhdmovies.my';
  const url = `${baseUrl}/page/${page}/?s=${encodeURIComponent(searchQuery)}`;

  const res = await axios.get(url, {
    headers: { ...commonHeaders, Referer: `${baseUrl}/` },
    signal,
  });
  const $ = cheerio.load(res.data as string);
  const posts: Post[] = [];

  $('article.gridlove-post, article.post, div.post-item').each((_: number, el: any) => {
    const anchor = $(el).find('a[title]').first();
    const title = anchor.attr('title') || $(el).find('h1.sanket, .entry-title').text().trim();
    const link = anchor.attr('href') || '';
    const image = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';

    if (title && link) {
      posts.push({
        title,
        link,
        image,
        provider: 'uhdMovies',
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
  const baseUrl = (await getBaseUrl('UhdMovies')) || 'https://uhdmovies.my';

  const res = await axios.get(link, {
    headers: { ...commonHeaders, Referer: `${baseUrl}/` },
    signal,
  });
  const $ = cheerio.load(res.data as string);

  const title = $('h1.entry-title').text().trim() || $('h1').text().trim();
  const image = $('div.entry-content img').first().attr('data-src') || $('div.entry-content img').first().attr('src') || '';
  const synopsis = $('div.entry-content p').first().text().trim();
  const type = title.toLowerCase().includes('season') || title.toLowerCase().includes('series') ? 'series' : 'movie';

  const linkList: Link[] = [];

  $('a[href*="driveleech"], a[href*="hubcloud"], a[href*="technicalboy"], a[href*="links"]').each((_: number, el: any) => {
    const href = $(el).attr('href');
    const label = $(el).text().trim() || 'Direct Link';
    if (href) {
      linkList.push({
        title: label,
        directLinks: [
          {
            title: label,
            link: href,
            type: type === 'movie' ? 'movie' : 'series',
          },
        ],
      });
    }
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

  try {
    const res = await axios.get(link, { headers: commonHeaders, signal });
    const $ = cheerio.load(res.data as string);

    $('a.btn, a[href*="drive"], a[href*="hubcloud"]').each((_: number, el: any) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim() || 'Fast Server';
      if (href) {
        streams.push({
          server: `UHD (${text})`,
          link: href,
          type: href.includes('.m3u8') ? 'm3u8' : 'mp4',
        });
      }
    });
  } catch {
    streams.push({
      server: 'UHD Leech',
      link,
      type: 'mp4',
    });
  }

  return streams;
}

export const UHDmoviesProvider: ProviderType = {
  catalog,
  genres: catalog.slice(1),
  searchFilter: 's',
  GetHomePage: getPosts,
  GetSearchPosts: getSearchPosts,
  GetInfo: getMeta,
  GetStream: getStream,
};
