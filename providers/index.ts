// ─── Phisher Vega Providers — Main Entry ────────────────────────────────────
// Streamlined bundle: MovieBox & MX Player

import { MovieBoxProvider } from './movieBox';
import { MXPlayerProvider } from './mxPlayer';
import { ProviderType } from './types';

export { MovieBoxProvider } from './movieBox';
export { MXPlayerProvider } from './mxPlayer';

export const PROVIDERS: Record<string, ProviderType> = {
  movieBox: MovieBoxProvider,
  mxPlayer: MXPlayerProvider,
};
