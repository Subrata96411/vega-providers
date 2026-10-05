"use strict";
var VegaProvider_movieBox = (() => {
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

  // providers/movieBox/index.ts
  var movieBox_exports = {};
  __export(movieBox_exports, {
    MovieBoxProvider: () => MovieBoxProvider,
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

  // providers/movieBox/index.ts
  var catalog = [
    { title: "Trending", filter: "/wefeed-h5api-bff/subject/trending" },
    { title: "Movies", filter: "/wefeed-h5api-bff/subject/trending?tabId=ONEROOM_MOVIE" },
    { title: "TV Series", filter: "/wefeed-h5api-bff/subject/trending?tabId=ONEROOM_TV" }
  ];
  var requestHeaders = {
    ...commonHeaders,
    Accept: "application/json",
    "x-client-info": JSON.stringify({ timezone: "Asia/Colombo" })
  };
  async function getPosts({
    filter,
    page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const baseUrl = await getBaseUrl("movieBoxWeb") || "https://officialmoviebox.com";
    const sep = filter.includes("?") ? "&" : "?";
    const url = `${baseUrl}${filter}${sep}page=${page}&perPage=20`;
    const res = await axios.get(url, { headers: requestHeaders, signal });
    const list = res.data?.data?.subjectList || [];
    return list.map((item) => ({
      title: item.title?.replace(/\s*\[.*?\]\s*$/, "") || item.title || "",
      link: `${baseUrl}/moviesDetail/${item.detailPath}`,
      image: item.cover?.url || "",
      provider: "movieBox",
      tag: item.releaseDate || void 0
    }));
  }
  async function getSearchPosts({
    searchQuery,
    page: _page,
    signal,
    providerContext
  }) {
    const { axios, cheerio } = providerContext;
    const baseUrl = await getBaseUrl("movieBoxWeb") || "https://officialmoviebox.com";
    const url = `${baseUrl}/newWeb/searchResult?keyword=${encodeURIComponent(searchQuery)}`;
    const res = await axios.get(url, { headers: commonHeaders, signal });
    const $ = cheerio.load(res.data);
    const posts = [];
    $('a[href*="/moviesDetail/"]').each((_, el) => {
      const card = $(el);
      const href = card.attr("href") || "";
      const title = card.find("h2, h3").first().text().trim() || card.find("img").attr("alt") || card.attr("title") || "";
      const img = card.find("img").attr("src") || card.find("img").attr("data-src") || "";
      if (title && href) {
        posts.push({
          title,
          link: href.startsWith("http") ? href : `${baseUrl}${href}`,
          image: img,
          provider: "movieBox"
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
    const res = await axios.get(link, { headers: commonHeaders, signal });
    const $ = cheerio.load(res.data);
    const title = $("h1").first().text().trim() || $('meta[property="og:title"]').attr("content") || "";
    const image = $('meta[property="og:image"]').attr("content") || "";
    const synopsis = $('meta[name="description"]').attr("content") || "";
    const type = link.toLowerCase().includes("tv") ? "series" : "movie";
    const streams = [];
    try {
      const nuxtRaw = $("#__NUXT_DATA__").text();
      if (nuxtRaw) {
        const nuxtData = JSON.parse(nuxtRaw);
        for (const item of nuxtData) {
          if (typeof item === "string" && (item.endsWith(".mp4") || item.includes(".m3u8")) && item.startsWith("http")) {
            if (!streams.includes(item))
              streams.push(item);
          }
        }
      }
    } catch {
    }
    const directLinks = streams.map((s, idx) => ({
      title: `Stream Server ${idx + 1}`,
      link: s,
      type: type === "movie" ? "movie" : "series"
    }));
    if (!directLinks.length) {
      directLinks.push({
        title: "Watch Online",
        link,
        type: type === "movie" ? "movie" : "series"
      });
    }
    return {
      title,
      image,
      synopsis,
      type,
      linkList: [
        {
          title: "Watch",
          directLinks
        }
      ]
    };
  }
  async function getStream({
    link
  }) {
    const streams = [];
    if (link.startsWith("http") && (link.includes(".mp4") || link.includes(".m3u8"))) {
      streams.push({
        server: "MovieBox Fast CDN",
        link,
        type: link.includes(".m3u8") ? "m3u8" : "mp4",
        headers: {
          Referer: "https://officialmoviebox.com/",
          Origin: "https://officialmoviebox.com"
        }
      });
    } else {
      streams.push({
        server: "MovieBox Stream",
        link,
        type: "m3u8"
      });
    }
    return streams;
  }
  var MovieBoxProvider = {
    catalog,
    genres: [],
    searchFilter: "keyword",
    GetHomePage: getPosts,
    GetSearchPosts: getSearchPosts,
    GetInfo: getMeta,
    GetStream: getStream
  };
  return __toCommonJS(movieBox_exports);
})();
