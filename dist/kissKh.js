"use strict";
var VegaProvider_kissKh = (() => {
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

  // providers/kissKh/index.ts
  var kissKh_exports = {};
  __export(kissKh_exports, {
    KissKhProvider: () => KissKhProvider,
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

  // providers/kissKh/index.ts
  var catalog = [
    { title: "Korean Drama", filter: "/api/DramaList/Drama/KDrama/list?pageSize=20" },
    { title: "Korean Movie", filter: "/api/DramaList/Drama/KMovie/list?pageSize=20" },
    { title: "Ongoing", filter: "/api/DramaList/Drama/Ongoing/list?pageSize=20" },
    { title: "Completed", filter: "/api/DramaList/Drama/Completed/list?pageSize=20" }
  ];
  async function getPosts({
    filter,
    page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const baseUrl = await getBaseUrl("kissKh") || "https://kisskh.is";
    const url = `${baseUrl}${filter}&page=${page}&type=0`;
    const res = await axios.get(url, {
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal
    });
    const list = res.data?.data || [];
    return list.map((item) => ({
      title: item.title || "",
      link: `${baseUrl}/Drama-Detail/${item.id}`,
      image: item.thumbnail || "",
      provider: "kissKh",
      tag: item.label || (item.episodesCount ? `${item.episodesCount} Ep` : void 0)
    }));
  }
  async function getSearchPosts({
    searchQuery,
    page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const baseUrl = await getBaseUrl("kissKh") || "https://kisskh.is";
    const url = `${baseUrl}/api/DramaList/Search?q=${encodeURIComponent(searchQuery)}&page=${page}&type=0`;
    const res = await axios.get(url, {
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal
    });
    const list = res.data?.data || [];
    return list.map((item) => ({
      title: item.title || "",
      link: `${baseUrl}/Drama-Detail/${item.id}`,
      image: item.thumbnail || "",
      provider: "kissKh"
    }));
  }
  async function getMeta({
    link,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const baseUrl = await getBaseUrl("kissKh") || "https://kisskh.is";
    const dramaId = link.split("/").pop() || "";
    const res = await axios.get(`${baseUrl}/api/DramaList/Drama/${dramaId}`, {
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal
    });
    const data = res.data || {};
    const title = data.title || "";
    const image = data.thumbnail || "";
    const synopsis = data.description || "";
    const type = data.type === "KMovie" ? "movie" : "series";
    const tags = (data.genres || []).map((g) => g.name);
    const rating = data.rating ? String(data.rating) : void 0;
    const linkList = [];
    const episodes = data.episodes || [];
    if (type === "movie") {
      if (episodes[0]) {
        linkList.push({
          title: "Watch Movie",
          directLinks: [{
            title: "Play",
            link: `kisskh-ep://${dramaId}::${episodes[0].id}`,
            type: "movie"
          }]
        });
      }
    } else {
      const directLinks = episodes.map((ep) => ({
        title: `Episode ${ep.number}${ep.title ? `: ${ep.title}` : ""}`,
        link: `kisskh-ep://${dramaId}::${ep.id}`,
        type: "series"
      }));
      linkList.push({ title: "Episodes", directLinks });
    }
    return { title, image, synopsis, type, rating, tags, linkList };
  }
  async function getStream({
    link,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const baseUrl = await getBaseUrl("kissKh") || "https://kisskh.is";
    const streams = [];
    const parts = link.replace("kisskh-ep://", "").split("::");
    const episodeId = parts[1];
    const streamRes = await axios.get(`${baseUrl}/api/Sub/${episodeId}.m3u8`, {
      params: { type: 2 },
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal
    });
    const m3u8Url = typeof streamRes.data === "string" ? streamRes.data.trim() : streamRes.data?.Url || "";
    if (m3u8Url) {
      const subtitles = [];
      try {
        const subRes = await axios.get(`${baseUrl}/api/Sub/${episodeId}`, {
          headers: { ...commonHeaders, Referer: `${baseUrl}/` },
          signal
        });
        const subList = subRes.data || [];
        for (const sub of subList) {
          subtitles.push({
            title: sub.lang || "English",
            language: (sub.lang || "en").slice(0, 2).toLowerCase(),
            type: "application/x-subrip",
            uri: sub.src || ""
          });
        }
      } catch {
      }
      streams.push({
        server: "KissKH",
        link: m3u8Url,
        type: "m3u8",
        subtitles: subtitles.length ? subtitles : void 0
      });
    }
    return streams;
  }
  var KissKhProvider = {
    catalog,
    genres: [],
    searchFilter: "q",
    GetHomePage: getPosts,
    GetSearchPosts: getSearchPosts,
    GetInfo: getMeta,
    GetStream: getStream
  };
  return __toCommonJS(kissKh_exports);
})();
