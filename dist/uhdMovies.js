"use strict";
var VegaProvider_uhdMovies = (() => {
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

  // providers/uhdMovies/index.ts
  var uhdMovies_exports = {};
  __export(uhdMovies_exports, {
    UHDmoviesProvider: () => UHDmoviesProvider,
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

  // providers/uhdMovies/index.ts
  var catalog = [
    { title: "Latest", filter: "" },
    { title: "4K Ultra HD", filter: "category/4k-ultra-hd" },
    { title: "Bollywood", filter: "category/bollywood" },
    { title: "Hollywood", filter: "category/hollywood-movies" },
    { title: "Web Series", filter: "category/web-series" },
    { title: "Hindi Dubbed", filter: "category/hindi-dubbed-movies" }
  ];
  async function getPosts({
    filter,
    page,
    signal,
    providerContext
  }) {
    const { axios, cheerio } = providerContext;
    const baseUrl = await getBaseUrl("UhdMovies") || "https://uhdmovies.my";
    const path = filter ? `${filter}/page/${page}/` : `page/${page}/`;
    const url = `${baseUrl}/${path}`;
    const res = await axios.get(url, {
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal
    });
    const $ = cheerio.load(res.data);
    const posts = [];
    $("article.gridlove-post, article.post, div.post-item").each((_, el) => {
      const anchor = $(el).find("a[title]").first();
      const title = anchor.attr("title") || $(el).find("h1.sanket, .entry-title").text().trim();
      const link = anchor.attr("href") || "";
      const image = $(el).find("img").attr("data-src") || $(el).find("img").attr("src") || "";
      if (title && link) {
        posts.push({
          title,
          link,
          image,
          provider: "uhdMovies"
        });
      }
    });
    return posts;
  }
  async function getSearchPosts({
    searchQuery,
    page,
    signal,
    providerContext
  }) {
    const { axios, cheerio } = providerContext;
    const baseUrl = await getBaseUrl("UhdMovies") || "https://uhdmovies.my";
    const url = `${baseUrl}/page/${page}/?s=${encodeURIComponent(searchQuery)}`;
    const res = await axios.get(url, {
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal
    });
    const $ = cheerio.load(res.data);
    const posts = [];
    $("article.gridlove-post, article.post, div.post-item").each((_, el) => {
      const anchor = $(el).find("a[title]").first();
      const title = anchor.attr("title") || $(el).find("h1.sanket, .entry-title").text().trim();
      const link = anchor.attr("href") || "";
      const image = $(el).find("img").attr("data-src") || $(el).find("img").attr("src") || "";
      if (title && link) {
        posts.push({
          title,
          link,
          image,
          provider: "uhdMovies"
        });
      }
    });
    return posts;
  }
  async function getMeta({
    link,
    signal,
    providerContext
  }) {
    const { axios, cheerio } = providerContext;
    const baseUrl = await getBaseUrl("UhdMovies") || "https://uhdmovies.my";
    const res = await axios.get(link, {
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal
    });
    const $ = cheerio.load(res.data);
    const title = $("h1.entry-title").text().trim() || $("h1").text().trim();
    const image = $("div.entry-content img").first().attr("data-src") || $("div.entry-content img").first().attr("src") || "";
    const synopsis = $("div.entry-content p").first().text().trim();
    const type = title.toLowerCase().includes("season") || title.toLowerCase().includes("series") ? "series" : "movie";
    const linkList = [];
    $('a[href*="driveleech"], a[href*="hubcloud"], a[href*="technicalboy"], a[href*="links"]').each((_, el) => {
      const href = $(el).attr("href");
      const label = $(el).text().trim() || "Direct Link";
      if (href) {
        linkList.push({
          title: label,
          directLinks: [
            {
              title: label,
              link: href,
              type: type === "movie" ? "movie" : "series"
            }
          ]
        });
      }
    });
    return {
      title,
      image,
      synopsis,
      type,
      linkList
    };
  }
  async function getStream({
    link,
    signal,
    providerContext
  }) {
    const { axios, cheerio } = providerContext;
    const streams = [];
    try {
      const res = await axios.get(link, { headers: commonHeaders, signal });
      const $ = cheerio.load(res.data);
      $('a.btn, a[href*="drive"], a[href*="hubcloud"]').each((_, el) => {
        const href = $(el).attr("href");
        const text = $(el).text().trim() || "Fast Server";
        if (href) {
          streams.push({
            server: `UHD (${text})`,
            link: href,
            type: href.includes(".m3u8") ? "m3u8" : "mp4"
          });
        }
      });
    } catch {
      streams.push({
        server: "UHD Leech",
        link,
        type: "mp4"
      });
    }
    return streams;
  }
  var UHDmoviesProvider = {
    catalog,
    genres: catalog.slice(1),
    searchFilter: "s",
    GetHomePage: getPosts,
    GetSearchPosts: getSearchPosts,
    GetInfo: getMeta,
    GetStream: getStream
  };
  return __toCommonJS(uhdMovies_exports);
})();
