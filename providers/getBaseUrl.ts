const urlsEndpoint =
  "https://raw.githubusercontent.com/Zenda-Cross/vega-providers/refs/heads/main/urls.json";
const cacheTtl = 60 * 60 * 1000;

type ProviderUrls = Record<string, { url: string }>;

type BaseUrlCache = {
  data?: ProviderUrls;
  expiresAt: number;
  request?: Promise<ProviderUrls>;
};

type ProviderState = {
  __vegaProviderBaseUrlCache__?: BaseUrlCache;
};

declare const providerGlobal: ProviderState | undefined;

function getCache(): BaseUrlCache {
  const state =
    typeof providerGlobal !== "undefined" && providerGlobal
      ? providerGlobal
      : (globalThis as typeof globalThis & ProviderState);

  state.__vegaProviderBaseUrlCache__ ??= { expiresAt: 0 };
  return state.__vegaProviderBaseUrlCache__;
}

// Fallback registry in case GitHub is unreachable or ratelimited
const FALLBACK_DOMAINS: ProviderUrls = {
  hdhub: { url: "https://new1.hdhub4u.free" },
  kissKh: { url: "https://kisskh.is" },
  UhdMovies: { url: "https://uhdmovies.my" },
  kickAssAnime: { url: "https://kaa.lt" },
  movieBoxWeb: { url: "https://officialmoviebox.com" },
  movieBox: { url: "https://officialmoviebox.com" },
  showbox: { url: "https://www.showbox.media" },
};

async function fetchProviderUrls(): Promise<ProviderUrls> {
  const cache = getCache();

  if (cache.data && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  if (cache.request) {
    return cache.request;
  }

  const request = fetch(urlsEndpoint)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`URL configuration request failed: ${response.status}`);
      }
      const data = (await response.json()) as ProviderUrls;
      cache.data = data;
      cache.expiresAt = Date.now() + cacheTtl;
      return data;
    })
    .catch((error) => {
      if (cache.data) {
        return cache.data;
      }
      return FALLBACK_DOMAINS;
    })
    .finally(() => {
      cache.request = undefined;
    });

  Object.defineProperty(cache, "request", {
    configurable: true,
    enumerable: false,
    value: request,
    writable: true,
  });
  return request;
}

export const getBaseUrl = async (providerValue: string): Promise<string> => {
  try {
    const providerUrls = await fetchProviderUrls();
    return providerUrls[providerValue]?.url ?? FALLBACK_DOMAINS[providerValue]?.url ?? "";
  } catch {
    return FALLBACK_DOMAINS[providerValue]?.url ?? "";
  }
};
