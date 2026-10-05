// ─── MXPlayer / M Player Provider for vega-app ─────────────────────────────

import { ProviderType } from '../types';
import { catalog } from './catalog';
import { getPosts, getSearchPosts } from './posts';
import { getMeta } from './meta';
import { getStream } from './stream';
import { getEpisodes } from './episodes';

export const MXPlayerProvider: ProviderType & { GetEpisodeLinks?: any } = {
  catalog,
  genres: catalog.slice(2),
  searchFilter: 'query',
  GetHomePage: getPosts,
  GetSearchPosts: getSearchPosts,
  GetInfo: getMeta,
  GetStream: getStream,
  GetEpisodeLinks: getEpisodes,
};
