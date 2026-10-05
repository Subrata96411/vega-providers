// ─── KissKh Provider for vega-app ──────────────────────────────────────────
// Ported from phisher98/cloudstream-extensions-phisher KisskhProvider ext.
// KissKH — Korean dramas, movies, variety shows with embedded subtitles.

import { Catalog, Info, Link, Post, ProviderContext, ProviderType, Stream, TextTracks } from '../types';
import { commonHeaders } from '../headers';
import { getBaseUrl } from '../getBaseUrl';

export const catalog: Catalog[] = [
  { title: 'Korean Drama', filter: '/api/DramaList/Drama/KDrama/list?pageSize=20' },
  { title: 'Korean Movie', filter: '/api/DramaList/Drama/KMovie/list?pageSize=20' },
  { title: 'Ongoing', filter: '/api/DramaList/Drama/Ongoing/list?pageSize=20' },
  { title: 'Completed', filter: '/api/DramaList/Drama/Completed/list?pageSize=20' },
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
  const { axios } = providerContext;
  const baseUrl = (await getBaseUrl('kissKh')) || 'https://kisskh.is';
  const url = `${baseUrl}${filter}&page=${page}&type=0`;

  const res = await axios.get(url, {
    headers: { ...commonHeaders, Referer: `${baseUrl}/` },
    signal,
  });

  const list: any[] = res.data?.data || [];
  return list.map((item: any): Post => ({
    title: item.title || '',
    link: `${baseUrl}/Drama-Detail/${item.id}`,
    image: item.thumbnail || '',
    provider: 'kissKh',
    tag: item.label || (item.episodesCount ? `${item.episodesCount} Ep` : undefined),
  }));
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
  const baseUrl = (await getBaseUrl('kissKh')) || 'https://kisskh.is';
  const url = `${baseUrl}/api/DramaList/Search?q=${encodeURIComponent(searchQuery)}&page=${page}&type=0`;

  const res = await axios.get(url, {
    headers: { ...commonHeaders, Referer: `${baseUrl}/` },
    signal,
  });

  const list: any[] = res.data?.data || [];
  return list.map((item: any): Post => ({
    title: item.title || '',
    link: `${baseUrl}/Drama-Detail/${item.id}`,
    image: item.thumbnail || '',
    provider: 'kissKh',
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
  const { axios } = providerContext;
  const baseUrl = (await getBaseUrl('kissKh')) || 'https://kisskh.is';
  const dramaId = link.split('/').pop() || '';

  const res = await axios.get(`${baseUrl}/api/DramaList/Drama/${dramaId}`, {
    headers: { ...commonHeaders, Referer: `${baseUrl}/` },
    signal,
  });

  const data = res.data || {};
  const title = data.title || '';
  const image = data.thumbnail || '';
  const synopsis = data.description || '';
  const type = data.type === 'KMovie' ? 'movie' : 'series';
  const tags: string[] = (data.genres || []).map((g: any) => g.name as string);
  const rating = data.rating ? String(data.rating) : undefined;

  const linkList: Link[] = [];
  const episodes: any[] = data.episodes || [];

  if (type === 'movie') {
    if (episodes[0]) {
      linkList.push({
        title: 'Watch Movie',
        directLinks: [{
          title: 'Play',
          link: `kisskh-ep://${dramaId}::${episodes[0].id}`,
          type: 'movie',
        }],
      });
    }
  } else {
    const directLinks: Link['directLinks'] = episodes.map((ep: any) => ({
      title: `Episode ${ep.number}${ep.title ? `: ${ep.title}` : ''}`,
      link: `kisskh-ep://${dramaId}::${ep.id}`,
      type: 'series' as const,
    }));
    linkList.push({ title: 'Episodes', directLinks });
  }

  return { title, image, synopsis, type, rating, tags, linkList };
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
  const { axios } = providerContext;
  const baseUrl = (await getBaseUrl('kissKh')) || 'https://kisskh.is';
  const streams: Stream[] = [];

  const parts = link.replace('kisskh-ep://', '').split('::');
  const episodeId = parts[1];

  const streamRes = await axios.get(`${baseUrl}/api/Sub/${episodeId}.m3u8`, {
    params: { type: 2 },
    headers: { ...commonHeaders, Referer: `${baseUrl}/` },
    signal,
  });

  const m3u8Url: string = typeof streamRes.data === 'string'
    ? streamRes.data.trim()
    : streamRes.data?.Url || '';

  if (m3u8Url) {
    const subtitles: TextTracks = [];
    try {
      const subRes = await axios.get(`${baseUrl}/api/Sub/${episodeId}`, {
        headers: { ...commonHeaders, Referer: `${baseUrl}/` },
        signal,
      });
      const subList: any[] = subRes.data || [];
      for (const sub of subList) {
        subtitles.push({
          title: sub.lang || 'English',
          language: (sub.lang || 'en').slice(0, 2).toLowerCase(),
          type: 'application/x-subrip',
          uri: sub.src || '',
        });
      }
    } catch { /* subs optional */ }

    streams.push({
      server: 'KissKH',
      link: m3u8Url,
      type: 'm3u8',
      subtitles: subtitles.length ? subtitles : undefined,
    });
  }

  return streams;
}

export const KissKhProvider: ProviderType = {
  catalog,
  genres: [],
  searchFilter: 'q',
  GetHomePage: getPosts,
  GetSearchPosts: getSearchPosts,
  GetInfo: getMeta,
  GetStream: getStream,
};
