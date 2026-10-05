"use strict";
var VegaProvider_hiAnime = (() => {
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

  // providers/hiAnime/index.ts
  var hiAnime_exports = {};
  __export(hiAnime_exports, {
    HiAnimeProvider: () => HiAnimeProvider,
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

  // providers/hiAnime/index.ts
  var catalog = [
    { title: "Top Airing", filter: "top-airing" },
    { title: "Most Popular", filter: "most-popular" },
    { title: "Most Favorite", filter: "most-favorite" },
    { title: "Latest Completed", filter: "completed" }
  ];
  var DOMAINS = ["https://hianime.to", "https://aniwatchtv.to", "https://hianime.nz"];
  async function getLiveBase(axios, signal) {
    for (const d of DOMAINS) {
      try {
        const res = await axios.get(d, {
          headers: commonHeaders,
          timeout: 4e3,
          signal
        });
        if (res.status === 200)
          return d;
      } catch {
      }
    }
    return DOMAINS[0];
  }
  async function getPosts({
    filter,
    page,
    signal,
    providerContext
  }) {
    const { axios, cheerio } = providerContext;
    const baseUrl = await getLiveBase(axios, signal);
    const url = `${baseUrl}/${filter}?page=${page}`;
    const res = await axios.get(url, { headers: commonHeaders, signal });
    const $ = cheerio.load(res.data);
    const posts = [];
    $("div.film_list-wrap div.flw-item").each((_, el) => {
      const $el = $(el);
      const anchor = $el.find("a.film-poster-ahref").first();
      const link = anchor.attr("href") || "";
      const title = $el.find("h3.film-name a").text().trim() || $el.find(".film-name").text().trim();
      const image = $el.find("img.film-poster-img").attr("data-src") || $el.find("img").attr("src") || "";
      const tag = $el.find(".tick-sub").text().trim() || void 0;
      if (link && title) {
        posts.push({
          title,
          link: link.startsWith("http") ? link : `${baseUrl}${link}`,
          image,
          provider: "hiAnime",
          tag
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
    const baseUrl = await getLiveBase(axios, signal);
    const url = `${baseUrl}/search?keyword=${encodeURIComponent(searchQuery)}&page=${page}`;
    const res = await axios.get(url, { headers: commonHeaders, signal });
    const $ = cheerio.load(res.data);
    const posts = [];
    $("div.film_list-wrap div.flw-item").each((_, el) => {
      const $el = $(el);
      const anchor = $el.find("a.film-poster-ahref").first();
      const link = anchor.attr("href") || "";
      const title = $el.find("h3.film-name a").text().trim() || "";
      const image = $el.find("img.film-poster-img").attr("data-src") || $el.find("img").attr("src") || "";
      if (link && title) {
        posts.push({
          title,
          link: link.startsWith("http") ? link : `${baseUrl}${link}`,
          image,
          provider: "hiAnime"
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
    const title = $("h2.film-name").text().trim() || $("h1").text().trim();
    const image = $("div.film-poster img").attr("src") || "";
    const synopsis = $("div.film-description .text").text().trim();
    const type = link.includes("/movie") ? "movie" : "series";
    return {
      title,
      image,
      synopsis,
      type,
      linkList: [
        {
          title: "Watch",
          directLinks: [{ title: "Stream", link, type: type === "movie" ? "movie" : "series" }]
        }
      ]
    };
  }
  async function getStream({
    link
  }) {
    return [
      {
        server: "HiAnime Stream",
        link,
        type: "m3u8"
      }
    ];
  }
  var HiAnimeProvider = {
    catalog,
    genres: [],
    searchFilter: "keyword",
    GetHomePage: getPosts,
    GetSearchPosts: getSearchPosts,
    GetInfo: getMeta,
    GetStream: getStream
  };
  return __toCommonJS(hiAnime_exports);
})();
