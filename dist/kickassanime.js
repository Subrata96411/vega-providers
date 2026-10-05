"use strict";
var VegaProvider_kickassanime = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // providers/kickassanime/index.ts
  var kickassanime_exports = {};
  __export(kickassanime_exports, {
    KickassanimeProvider: () => KickassanimeProvider,
    catalog: () => catalog,
    getMeta: () => getMeta,
    getPosts: () => getPosts,
    getSearchPosts: () => getSearchPosts,
    getStream: () => getStream
  });

  // providers/headers.ts
  var commonHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/"
  };
  var mobileHeaders = {
    ...commonHeaders,
    "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
  };

  // providers/getBaseUrl.ts
  var urlsEndpoint = "https://raw.githubusercontent.com/Zenda-Cross/vega-providers/refs/heads/main/urls.json";
  var cacheTtl = 60 * 60 * 1e3;
  function getCache() {
    const state = typeof providerGlobal !== "undefined" && providerGlobal ? providerGlobal : globalThis;
    state.__vegaProviderBaseUrlCache__ ?? (state.__vegaProviderBaseUrlCache__ = { expiresAt: 0 });
    return state.__vegaProviderBaseUrlCache__;
  }
  var FALLBACK_DOMAINS = {
    hdhub: { url: "https://new1.hdhub4u.free" },
    kissKh: { url: "https://kisskh.is" },
    UhdMovies: { url: "https://uhdmovies.my" },
    kickAssAnime: { url: "https://kaa.lt" },
    movieBoxWeb: { url: "https://officialmoviebox.com" },
    showbox: { url: "https://www.showbox.media" }
  };
  async function fetchProviderUrls() {
    const cache = getCache();
    if (cache.data && Date.now() < cache.expiresAt) {
      return cache.data;
    }
    if (cache.request) {
      return cache.request;
    }
    const request = fetch(urlsEndpoint).then(async (response) => {
      if (!response.ok) {
        throw new Error(`URL configuration request failed: ${response.status}`);
      }
      const data = await response.json();
      cache.data = data;
      cache.expiresAt = Date.now() + cacheTtl;
      return data;
    }).catch((error) => {
      if (cache.data) {
        return cache.data;
      }
      return FALLBACK_DOMAINS;
    }).finally(() => {
      cache.request = void 0;
    });
    Object.defineProperty(cache, "request", {
      configurable: true,
      enumerable: false,
      value: request,
      writable: true
    });
    return request;
  }
  var getBaseUrl = async (providerValue) => {
    try {
      const providerUrls = await fetchProviderUrls();
      return providerUrls[providerValue]?.url ?? FALLBACK_DOMAINS[providerValue]?.url ?? "";
    } catch {
      return FALLBACK_DOMAINS[providerValue]?.url ?? "";
    }
  };

  // providers/kickassanime/index.ts
  var catalog = [
    { title: "Recent", filter: "recent" },
    { title: "Popular", filter: "popular" }
  ];
  async function getPosts({
    filter,
    page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const baseUrl = await getBaseUrl("kickAssAnime") || "https://kaa.lt";
    const url = `${baseUrl}/api/show/${filter}?page=${page}`;
    const res = await axios.get(url, {
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal
    });
    const list = res.data?.result || res.data?.data || [];
    return list.map((item) => ({
      title: item.title || item.name || "",
      link: `${baseUrl}/anime/${item.slug || item.id}`,
      image: item.poster || item.banner || "",
      provider: "kickAssAnime",
      tag: item.type || void 0
    }));
  }
  async function getSearchPosts({
    searchQuery,
    page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const baseUrl = await getBaseUrl("kickAssAnime") || "https://kaa.lt";
    const url = `${baseUrl}/api/search?q=${encodeURIComponent(searchQuery)}&page=${page}`;
    const res = await axios.get(url, {
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal
    });
    const list = res.data?.result || res.data?.data || [];
    return list.map((item) => ({
      title: item.title || item.name || "",
      link: `${baseUrl}/anime/${item.slug || item.id}`,
      image: item.poster || item.banner || "",
      provider: "kickAssAnime"
    }));
  }
  async function getMeta({
    link,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const baseUrl = await getBaseUrl("kickAssAnime") || "https://kaa.lt";
    const slug = link.split("/anime/")[1] || "";
    const res = await axios.get(`${baseUrl}/api/show/${slug}`, {
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal
    });
    const data = res.data?.result || res.data || {};
    const title = data.title || data.name || "";
    const image = data.poster || "";
    const synopsis = data.synopsis || data.description || "";
    const type = data.type === "Movie" ? "movie" : "series";
    const episodes = data.episodes || [];
    const directLinks = episodes.map((ep) => ({
      title: `Ep ${ep.episode_number || ep.episodeNum || ""}: ${ep.title || ""}`.trim(),
      link: `kaa-play://${slug}::${ep.slug || ep.id}`,
      type: "series"
    }));
    return {
      title,
      image,
      synopsis,
      type,
      linkList: [{ title: "Episodes", directLinks }]
    };
  }
  async function getStream({
    link,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const baseUrl = await getBaseUrl("kickAssAnime") || "https://kaa.lt";
    const streams = [];
    const parts = link.replace("kaa-play://", "").split("::");
    const epSlug = parts[1];
    try {
      const res = await axios.get(`${baseUrl}/api/show/episode/${epSlug}`, {
        headers: { ...commonHeaders, Referer: `${baseUrl}/` },
        signal
      });
      const servers = res.data?.servers || [];
      for (const srv of servers) {
        if (srv.src) {
          streams.push({
            server: srv.name || "KickAssAnime",
            link: srv.src,
            type: srv.src.includes(".m3u8") ? "m3u8" : "mp4"
          });
        }
      }
    } catch {
    }
    return streams;
  }
  var KickassanimeProvider = {
    catalog,
    genres: [],
    searchFilter: "q",
    GetHomePage: getPosts,
    GetSearchPosts: getSearchPosts,
    GetInfo: getMeta,
    GetStream: getStream
  };
  return __toCommonJS(kickassanime_exports);
})();
