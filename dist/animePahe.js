"use strict";
var VegaProvider_animePahe = (() => {
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

  // providers/animePahe/index.ts
  var animePahe_exports = {};
  __export(animePahe_exports, {
    AnimePaheProvider: () => AnimePaheProvider,
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

  // providers/animePahe/index.ts
  var catalog = [
    { title: "Latest Airing", filter: "airing" },
    { title: "Popular", filter: "popular" },
    { title: "Completed", filter: "completed" }
  ];
  var BASE_URL = "https://animepahe.pw";
  var AP_HEADERS = {
    ...commonHeaders,
    Referer: `${BASE_URL}/`
  };
  async function getPosts({
    filter,
    page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const url = `${BASE_URL}/api?m=airing&page=${page}`;
    const res = await axios.get(url, { headers: AP_HEADERS, signal });
    const list = res.data?.data ?? [];
    return list.map((item) => ({
      title: item.anime_title || item.title || "",
      link: `animepahe://${item.anime_session || item.session}`,
      image: item.snapshot || "",
      provider: "animePahe",
      tag: `Ep ${item.episode}`
    }));
  }
  async function getSearchPosts({
    searchQuery,
    page: _page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const url = `${BASE_URL}/api?m=search&l=12&q=${encodeURIComponent(searchQuery)}`;
    const res = await axios.get(url, { headers: AP_HEADERS, signal });
    const list = res.data?.data ?? [];
    return list.map((item) => ({
      title: item.title || "",
      link: `animepahe://${item.session}`,
      image: item.poster || "",
      provider: "animePahe",
      tag: item.type || void 0,
      cornerTag: item.status || void 0
    }));
  }
  async function getMeta({
    link,
    signal,
    providerContext
  }) {
    const { axios, cheerio } = providerContext;
    const session = link.replace("animepahe://", "");
    const pageUrl = `${BASE_URL}/anime/${session}`;
    const res = await axios.get(pageUrl, { headers: AP_HEADERS, signal });
    const $ = cheerio.load(res.data);
    const title = $("div.title-wrapper h1 span").text().trim() || $("h1").text().trim();
    const image = $("div.anime-poster a").attr("href") || $("img.poster-image").attr("src") || "";
    const synopsis = $("div.anime-summary").text().trim();
    const type = $("div.anime-info").text().includes("Movie") ? "movie" : "series";
    const epRes = await axios.get(`${BASE_URL}/api?m=release&id=${session}&sort=episode_asc&page=1`, {
      headers: AP_HEADERS,
      signal
    });
    const epList = epRes.data?.data ?? [];
    const linkList = [];
    const directLinks = epList.map((ep) => ({
      title: `Episode ${ep.episode}`,
      link: `animepahe-play://${session}::${ep.session}::${ep.episode}`,
      type: type === "movie" ? "movie" : "series"
    }));
    linkList.push({
      title: "Episodes",
      directLinks
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
    const parts = link.replace("animepahe-play://", "").split("::");
    const animeSession = parts[0];
    const epSession = parts[1];
    const playUrl = `${BASE_URL}/play/${animeSession}/${epSession}`;
    const res = await axios.get(playUrl, { headers: AP_HEADERS, signal });
    const $ = cheerio.load(res.data);
    $("#pickDownload a, #resolutionMenu button").each((_, el) => {
      const kwikUrl = $(el).attr("href") || $(el).attr("data-src") || "";
      const label = $(el).text().trim();
      if (kwikUrl && kwikUrl.includes("kwik")) {
        streams.push({
          server: `Kwik (${label})`,
          link: kwikUrl,
          type: "m3u8",
          quality: label.includes("1080p") ? "1080" : label.includes("720p") ? "720" : "480"
        });
      }
    });
    return streams;
  }
  var AnimePaheProvider = {
    catalog,
    genres: [],
    searchFilter: "q",
    GetHomePage: getPosts,
    GetSearchPosts: getSearchPosts,
    GetInfo: getMeta,
    GetStream: getStream
  };
  return __toCommonJS(animePahe_exports);
})();
