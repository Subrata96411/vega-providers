"use strict";
var VegaProvider_hdHub4u = (() => {
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

  // providers/hdHub4u/index.ts
  var hdHub4u_exports = {};
  __export(hdHub4u_exports, {
    HDhub4uProvider: () => HDhub4uProvider,
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

  // providers/hdHub4u/index.ts
  var catalog = [
    { title: "Latest", filter: "" },
    { title: "Bollywood", filter: "category/bollywood-movies" },
    { title: "Hollywood (Hindi)", filter: "category/hollywood-hindi-dubbed-movies" },
    { title: "South (Hindi)", filter: "category/south-indian-hindi-dubbed-movies" },
    { title: "Web Series", filter: "category/web-series" }
  ];
  async function getPosts({
    filter,
    page,
    signal,
    providerContext
  }) {
    const { axios, cheerio } = providerContext;
    const baseUrl = await getBaseUrl("hdhub") || "https://new1.hdhub4u.free";
    const url = filter ? `${baseUrl}/${filter}/page/${page}/` : `${baseUrl}/page/${page}/`;
    const res = await axios.get(url, {
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal
    });
    const $ = cheerio.load(res.data);
    const posts = [];
    $("article.post-item, article.post, div.post").each((_, el) => {
      const anchor = $(el).find("a").first();
      const link = anchor.attr("href") || "";
      const title = $(el).find("h2, h3, .entry-title").text().trim() || anchor.attr("title") || "";
      const image = $(el).find("img").attr("data-src") || $(el).find("img").attr("src") || "";
      if (link && title) {
        posts.push({
          title,
          link,
          image,
          provider: "hdHub4u"
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
    const baseUrl = await getBaseUrl("hdhub") || "https://new1.hdhub4u.free";
    const url = `${baseUrl}/page/${page}/?s=${encodeURIComponent(searchQuery)}`;
    const res = await axios.get(url, {
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal
    });
    const $ = cheerio.load(res.data);
    const posts = [];
    $("article.post-item, article.post, div.post").each((_, el) => {
      const anchor = $(el).find("a").first();
      const link = anchor.attr("href") || "";
      const title = $(el).find("h2, h3, .entry-title").text().trim() || "";
      const image = $(el).find("img").attr("data-src") || $(el).find("img").attr("src") || "";
      if (link && title)
        posts.push({ title, link, image, provider: "hdHub4u" });
    });
    return posts;
  }
  async function getMeta({
    link,
    signal,
    providerContext
  }) {
    const { axios, cheerio } = providerContext;
    const baseUrl = await getBaseUrl("hdhub") || "https://new1.hdhub4u.free";
    const res = await axios.get(link, {
      headers: { ...commonHeaders, Referer: `${baseUrl}/` },
      signal
    });
    const $ = cheerio.load(res.data);
    const title = $("h1.entry-title, h1.post-title").first().text().trim();
    const image = $('meta[property="og:image"]').attr("content") || $("article img").first().attr("src") || "";
    const synopsis = $('meta[name="description"]').attr("content") || $("div.entry-content p").first().text().trim() || "";
    const isSeries = /season|episode|series/i.test(title);
    const type = isSeries ? "series" : "movie";
    const linkList = [];
    $('a[href*="hubdrive"], a[href*="hubcloud"], a[href*="gdrive"]').each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim() || "Server";
      if (href) {
        linkList.push({
          title: text,
          directLinks: [{ title: text, link: href, type: isSeries ? "series" : "movie" }]
        });
      }
    });
    return { title, image, synopsis, type, linkList };
  }
  async function getStream({
    link,
    signal,
    providerContext
  }) {
    const streams = [
      {
        server: "HDhub4u",
        link,
        type: link.includes(".m3u8") ? "m3u8" : "mp4"
      }
    ];
    return streams;
  }
  var HDhub4uProvider = {
    catalog,
    genres: catalog.slice(1),
    searchFilter: "s",
    GetHomePage: getPosts,
    GetSearchPosts: getSearchPosts,
    GetInfo: getMeta,
    GetStream: getStream
  };
  return __toCommonJS(hdHub4u_exports);
})();
