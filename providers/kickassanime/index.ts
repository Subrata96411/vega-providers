// ─── Kickassanime Provider for vega-app ────────────────────────────────────
// Ported from phisher98/cloudstream-extensions-phisher Kickassanime ext.
// Kickassanime — anime with sub/dub, uses JSON API.

import { Catalog, EpisodeLink, Info, Link, Post, ProviderContext, ProviderType, Stream } from '../types';
import { commonHeaders } from '../headers';
import { getBaseUrl } from '../getBaseUrl';

export const catalog: Catalog[] = [
  { title: 'Recent', filter: 'recent' },
  { title: 'Popular', filter: 'popular' },
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
  const baseUrl = (await getBaseUrl('kickAssAnime')) || 'https://kaa.lt';
  const url = `${baseUrl}/api/show/${filter}?page=${page}`;

  const res = await axios.get(url, {
    headers: { ...commonHeaders, Referer: `${baseUrl}/` },
    signal,
  });
  const list: any[] = res.data?.result || res.data?.data || [];

  return list.map((item: any): Post => ({
    title: item.title || item.name || '',
    link: `${baseUrl}/anime/${item.slug || item.id}`,
    image: item.poster || item.banner || '',
    provider: 'kickAssAnime',
    tag: item.type || undefined,
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
  const baseUrl = (await getBaseUrl('kickAssAnime')) || 'https://kaa.lt';
  const url = `${baseUrl}/api/search?q=${encodeURIComponent(searchQuery)}&page=${page}`;

  const res = await axios.get(url, {
    headers: { ...commonHeaders, Referer: `${baseUrl}/` },
    signal,
  });
  const list: any[] = res.data?.result || res.data?.data || [];

  return list.map((item: any): Post => ({
    title: item.title || item.name || '',
    link: `${baseUrl}/anime/${item.slug || item.id}`,
    image: item.poster || item.banner || '',
    provider: 'kickAssAnime',
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
  const baseUrl = (await getBaseUrl('kickAssAnime')) || 'https://kaa.lt';
  const slug = link.split('/anime/')[1] || '';

  const res = await axios.get(`${baseUrl}/api/show/${slug}`, {
    headers: { ...commonHeaders, Referer: `${baseUrl}/` },
    signal,
  });

  const data = res.data?.result || res.data || {};
  const title: string = data.title || data.name || '';
  const image: string = data.poster || '';
  const synopsis: string = data.synopsis || data.description || '';
  const type: string = data.type === 'Movie' ? 'movie' : 'series';

  const episodes: any[] = data.episodes || [];
  const directLinks: Link['directLinks'] = episodes.map((ep: any) => ({
    title: `Ep ${ep.episode_number || ep.episodeNum || ''}: ${ep.title || ''}`.trim(),
    link: `kaa-play://${slug}::${ep.slug || ep.id}`,
    type: 'series' as const,
  }));

  return {
    title,
    image,
    synopsis,
    type,
    linkList: [{ title: 'Episodes', directLinks }],
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
  const { axios } = providerContext;
  const baseUrl = (await getBaseUrl('kickAssAnime')) || 'https://kaa.lt';
  const streams: Stream[] = [];

  const parts = link.replace('kaa-play://', '').split('::');
  const epSlug = parts[1];

  try {
    const res = await axios.get(`${baseUrl}/api/show/episode/${epSlug}`, {
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal,
    });
    const servers: any[] = res.data?.servers || [];
    for (const srv of servers) {
      if (srv.src) {
        streams.push({
          server: srv.name || 'KickAssAnime',
          link: srv.src,
          type: srv.src.includes('.m3u8') ? 'm3u8' : 'mp4',
        });
      }
    }
  } catch { /* skip */ }

  return streams;
}

export const KickassanimeProvider: ProviderType = {
  catalog,
  genres: [],
  searchFilter: 'q',
  GetHomePage: getPosts,
  GetSearchPosts: getSearchPosts,
  GetInfo: getMeta,
  GetStream: getStream,
};
