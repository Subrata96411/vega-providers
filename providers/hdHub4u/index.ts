// ─── HDhub4u Provider for vega-app ─────────────────────────────────────────
// Ported from phisher98/cloudstream-extensions-phisher HDhub4u CloudStream ext.
// Indian movies (Bollywood, South, Hollywood dub), web series.

import { Catalog, Info, Link, Post, ProviderContext, ProviderType, Stream } from '../types';
import { commonHeaders } from '../headers';
import { getBaseUrl } from '../getBaseUrl';

export const catalog: Catalog[] = [
  { title: 'Latest', filter: '' },
  { title: 'Bollywood', filter: 'category/bollywood-movies' },
  { title: 'Hollywood (Hindi)', filter: 'category/hollywood-hindi-dubbed-movies' },
  { title: 'South (Hindi)', filter: 'category/south-indian-hindi-dubbed-movies' },
  { title: 'Web Series', filter: 'category/web-series' },
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
  const baseUrl = (await getBaseUrl('hdhub')) || 'https://new1.hdhub4u.free';
  const url = filter ? `${baseUrl}/${filter}/page/${page}/` : `${baseUrl}/page/${page}/`;

  const res = await axios.get(url, {
    headers: { ...commonHeaders, Referer: `${baseUrl}/` },
    signal,
  });
  const $ = cheerio.load(res.data as string);
  const posts: Post[] = [];

  $('article.post-item, article.post, div.post').each((_: number, el: any) => {
    const anchor = $(el).find('a').first();
    const link = anchor.attr('href') || '';
    const title = $(el).find('h2, h3, .entry-title').text().trim() || anchor.attr('title') || '';
    const image = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';

    if (link && title) {
      posts.push({
        title,
        link,
        image,
        provider: 'hdHub4u',
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
  const baseUrl = (await getBaseUrl('hdhub')) || 'https://new1.hdhub4u.free';
  const url = `${baseUrl}/page/${page}/?s=${encodeURIComponent(searchQuery)}`;

  const res = await axios.get(url, {
    headers: { ...commonHeaders, Referer: `${baseUrl}/` },
    signal,
  });
  const $ = cheerio.load(res.data as string);
  const posts: Post[] = [];

  $('article.post-item, article.post, div.post').each((_: number, el: any) => {
    const anchor = $(el).find('a').first();
    const link = anchor.attr('href') || '';
    const title = $(el).find('h2, h3, .entry-title').text().trim() || '';
    const image = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';
    if (link && title) posts.push({ title, link, image, provider: 'hdHub4u' });
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
  const baseUrl = (await getBaseUrl('hdhub')) || 'https://new1.hdhub4u.free';

  const res = await axios.get(link, {
    headers: { ...commonHeaders, Referer: `${baseUrl}/` },
    signal,
  });
  const $ = cheerio.load(res.data as string);

  const title = $('h1.entry-title, h1.post-title').first().text().trim();
  const image = $('meta[property="og:image"]').attr('content') || $('article img').first().attr('src') || '';
  const synopsis = $('meta[name="description"]').attr('content') || $('div.entry-content p').first().text().trim() || '';

  const isSeries = /season|episode|series/i.test(title);
  const type = isSeries ? 'series' : 'movie';
  const linkList: Link[] = [];

  $('a[href*="hubdrive"], a[href*="hubcloud"], a[href*="gdrive"]').each((_: number, el: any) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim() || 'Server';
    if (href) {
      linkList.push({
        title: text,
        directLinks: [{ title: text, link: href, type: isSeries ? 'series' : 'movie' }],
      });
    }
  });

  return { title, image, synopsis, type, linkList };
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
  const streams: Stream[] = [
    {
      server: 'HDhub4u',
      link,
      type: link.includes('.m3u8') ? 'm3u8' : 'mp4',
    },
  ];
  return streams;
}

export const HDhub4uProvider: ProviderType = {
  catalog,
  genres: catalog.slice(1),
  searchFilter: 's',
  GetHomePage: getPosts,
  GetSearchPosts: getSearchPosts,
  GetInfo: getMeta,
  GetStream: getStream,
};
