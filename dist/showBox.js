"use strict";
var VegaProvider_showBox = (() => {
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

  // providers/showBox/index.ts
  var showBox_exports = {};
  __export(showBox_exports, {
    ShowBoxProvider: () => ShowBoxProvider,
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

  // providers/showBox/index.ts
  var catalog = [
    { title: "Trending", filter: "trending" },
    { title: "Movies", filter: "movies" },
    { title: "TV Shows", filter: "tv-shows" },
    { title: "Top Rated", filter: "top-rated" },
    { title: "Action", filter: "genre/action" },
    { title: "Adventure", filter: "genre/adventure" },
    { title: "Animation", filter: "genre/animation" },
    { title: "Comedy", filter: "genre/comedy" },
    { title: "Crime", filter: "genre/crime" },
    { title: "Documentary", filter: "genre/documentary" },
    { title: "Drama", filter: "genre/drama" },
    { title: "Fantasy", filter: "genre/fantasy" },
    { title: "Horror", filter: "genre/horror" },
    { title: "Mystery", filter: "genre/mystery" },
    { title: "Romance", filter: "genre/romance" },
    { title: "Sci-Fi", filter: "genre/science-fiction" },
    { title: "Thriller", filter: "genre/thriller" },
    { title: "War", filter: "genre/war" },
    { title: "Western", filter: "genre/western" }
  ];
  var BASE_API = "https://www.showbox.media/api";
  var BOX_TOKEN = "oxRyYep4yS2GKDh0";
  var FEBOX_API = "https://feboxapi.com/api/v1";
  var SB_HEADERS = {
    ...commonHeaders,
    "Origin": "https://www.showbox.media",
    "Referer": "https://www.showbox.media/"
  };
  function mapCategory(filter) {
    const genreMap = {
      "genre/action": 28,
      "genre/adventure": 12,
      "genre/animation": 16,
      "genre/comedy": 35,
      "genre/crime": 80,
      "genre/documentary": 99,
      "genre/drama": 18,
      "genre/fantasy": 14,
      "genre/horror": 27,
      "genre/mystery": 9648,
      "genre/romance": 10749,
      "genre/science-fiction": 878,
      "genre/thriller": 53,
      "genre/war": 10752,
      "genre/western": 37
    };
    if (filter === "movies" || filter.startsWith("genre/") || filter === "top-rated" || filter === "trending") {
      return { type: 1, genre: genreMap[filter] };
    }
    if (filter === "tv-shows") {
      return { type: 2 };
    }
    return { type: 1 };
  }
  async function getPosts({
    filter,
    page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const { type, genre } = mapCategory(filter);
    const sort = filter === "top-rated" ? "top_rated" : filter === "trending" ? "popularity" : "release";
    const params = {
      token: BOX_TOKEN,
      page,
      count: 24,
      sort,
      type
    };
    if (genre)
      params.genre = genre;
    const res = await axios.get(`${BASE_API}/media/list`, {
      params,
      headers: SB_HEADERS,
      signal
    });
    const data = res.data;
    if (!data?.data?.list)
      return [];
    return data.data.list.map((item) => ({
      title: item.title || item.name || "",
      link: `showbox://${item.id}::${item.type ?? type}`,
      image: `https://image.tmdb.org/t/p/w500${item.poster_path}` || "",
      provider: "showBox",
      tag: item.type === 2 ? "TV" : "Movie",
      cornerTag: item.quality || void 0
    }));
  }
  async function getSearchPosts({
    searchQuery,
    page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const res = await axios.get(`${BASE_API}/search`, {
      params: {
        token: BOX_TOKEN,
        keyword: searchQuery,
        page,
        count: 24
      },
      headers: SB_HEADERS,
      signal
    });
    const data = res.data;
    if (!data?.data?.list)
      return [];
    return data.data.list.map((item) => ({
      title: item.title || item.name || "",
      link: `showbox://${item.id}::${item.type}`,
      image: `https://image.tmdb.org/t/p/w500${item.poster_path}` || "",
      provider: "showBox",
      tag: item.type === 2 ? "TV" : "Movie"
    }));
  }
  async function getMeta({
    link,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const [id, rawType] = link.replace("showbox://", "").split("::");
    const mediaType = parseInt(rawType, 10) || 1;
    const res = await axios.get(`${BASE_API}/media/detail`, {
      params: { token: BOX_TOKEN, id, type: mediaType },
      headers: SB_HEADERS,
      signal
    });
    const item = res.data?.data || {};
    const title = item.title || item.name || "";
    const image = `https://image.tmdb.org/t/p/w500${item.poster_path}` || "";
    const poster = `https://image.tmdb.org/t/p/original${item.backdrop_path}` || void 0;
    const synopsis = item.description || item.overview || "";
    const rating = item.score ? String(item.score) : void 0;
    const tags = (item.genres || []).map((g) => g.name);
    const type = mediaType === 2 ? "series" : "movie";
    const linkList = [];
    if (type === "movie") {
      linkList.push({
        title: "Watch Movie",
        directLinks: [{ title: "Play", link: `${link}::movie`, type: "movie" }]
      });
    } else {
      const seasons = item.seasons || [];
      for (const season of seasons) {
        const eps = (season.episodes || []).map((ep) => ({
          title: `E${ep.episode}: ${ep.title || ""}`.trim(),
          link: `showbox-ep://${id}::${mediaType}::${season.season}::${ep.episode}`,
          type: "series",
          description: ep.synopsis || void 0
        }));
        linkList.push({ title: `Season ${season.season}`, directLinks: eps });
      }
    }
    return {
      title,
      image,
      poster,
      synopsis,
      type,
      rating,
      tags,
      linkList,
      populateMeta: true
    };
  }
  async function getStream({
    link,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const streams = [];
    let id = "", mediaType = 1, season = 0, episode = 0;
    if (link.startsWith("showbox-ep://")) {
      const parts = link.replace("showbox-ep://", "").split("::");
      id = parts[0];
      mediaType = parseInt(parts[1], 10);
      season = parseInt(parts[2], 10);
      episode = parseInt(parts[3], 10);
    } else {
      const parts = link.replace("showbox://", "").split("::");
      id = parts[0];
      mediaType = parseInt(parts[1], 10);
    }
    const params = {
      token: BOX_TOKEN,
      id,
      type: mediaType
    };
    if (season) {
      params.season = season;
      params.episode = episode;
    }
    const serversRes = await axios.get(`${FEBOX_API}/media/providers`, {
      params: { ...params, fid: id },
      headers: SB_HEADERS,
      signal
    });
    const serverList = serversRes.data?.data || [];
    for (const srv of serverList.slice(0, 3)) {
      try {
        const streamRes = await axios.get(`${FEBOX_API}/media/provider`, {
          params: { ...params, sid: srv.id },
          headers: SB_HEADERS,
          signal
        });
        const links = streamRes.data?.data?.list || [];
        for (const item of links) {
          if (item.url) {
            streams.push({
              server: srv.name || "ShowBox",
              link: item.url,
              type: item.url.includes(".m3u8") ? "m3u8" : "mp4",
              quality: item.quality || void 0
            });
          }
        }
      } catch {
      }
    }
    return streams;
  }
  var ShowBoxProvider = {
    catalog,
    genres: catalog.slice(4),
    searchFilter: "keyword",
    GetHomePage: getPosts,
    GetSearchPosts: getSearchPosts,
    GetInfo: getMeta,
    GetStream: getStream
  };
  return __toCommonJS(showBox_exports);
})();
