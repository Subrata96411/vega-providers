"use strict";
var VegaProvider_superStream = (() => {
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

  // providers/superStream/index.ts
  var superStream_exports = {};
  __export(superStream_exports, {
    SuperStreamProvider: () => SuperStreamProvider,
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

  // providers/superStream/index.ts
  var catalog = [
    { title: "Featured", filter: "0" },
    { title: "Movies", filter: "movie" },
    { title: "TV Shows", filter: "tv" },
    { title: "Action", filter: "genre::Action" },
    { title: "Adventure", filter: "genre::Adventure" },
    { title: "Animation", filter: "genre::Animation" },
    { title: "Comedy", filter: "genre::Comedy" },
    { title: "Crime", filter: "genre::Crime" },
    { title: "Documentary", filter: "genre::Documentary" },
    { title: "Drama", filter: "genre::Drama" },
    { title: "Family", filter: "genre::Family" },
    { title: "Fantasy", filter: "genre::Fantasy" },
    { title: "History", filter: "genre::History" },
    { title: "Horror", filter: "genre::Horror" },
    { title: "Music", filter: "genre::Music" },
    { title: "Mystery", filter: "genre::Mystery" },
    { title: "Romance", filter: "genre::Romance" },
    { title: "Sci-Fi", filter: "genre::Sci-Fi" },
    { title: "Sport", filter: "genre::Sport" },
    { title: "Thriller", filter: "genre::Thriller" },
    { title: "War", filter: "genre::War" },
    { title: "Western", filter: "genre::Western" }
  ];
  var SS_API2 = "https://superjojo.com";
  var SS_KEY = "8b4af33e7fb8b1cb3c6e4d63a5e9f27a";
  var SS_HEADERS = {
    ...commonHeaders,
    Platform: "android",
    "X-Requested-With": "XMLHttpRequest"
  };
  function md5Hex(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0").repeat(4).slice(0, 32);
  }
  function buildSSParams(params) {
    const ts = Math.floor(Date.now() / 1e3).toString();
    const sign = md5Hex(md5Hex(SS_KEY) + ts);
    return { ...params, timestamp: ts, sign };
  }
  async function getPosts({
    filter,
    page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    let apiUrl = `${SS_API2}/api/v1/`;
    let params = { page };
    if (filter === "0") {
      apiUrl += "movie/home";
      params = buildSSParams({ ...params });
    } else if (filter === "movie") {
      apiUrl += "movie/list";
      params = buildSSParams({ ...params, type: 1 });
    } else if (filter === "tv") {
      apiUrl += "movie/list";
      params = buildSSParams({ ...params, type: 2 });
    } else if (filter.startsWith("genre::")) {
      const genre = filter.split("::")[1];
      apiUrl += "movie/list";
      params = buildSSParams({ ...params, genre });
    }
    const res = await axios.get(apiUrl, { params, headers: SS_HEADERS, signal });
    const list = res.data?.data?.list ?? res.data?.data ?? [];
    return list.map((item) => ({
      title: item.title || item.name || "",
      link: `superstream://${item.id}::${item.box_type ?? 1}`,
      image: item.poster_org || item.poster || "",
      provider: "superStream",
      tag: item.box_type === 2 ? "TV" : "Movie",
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
    const params = buildSSParams({ keyword: searchQuery, page });
    const res = await axios.get(`${SS_API2}/api/v1/search`, {
      params,
      headers: SS_HEADERS,
      signal
    });
    const list = res.data?.data?.list ?? [];
    return list.map((item) => ({
      title: item.title || item.name || "",
      link: `superstream://${item.id}::${item.box_type ?? 1}`,
      image: item.poster_org || item.poster || "",
      provider: "superStream",
      tag: item.box_type === 2 ? "TV" : "Movie"
    }));
  }
  async function getMeta({
    link,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const [id, rawType] = link.replace("superstream://", "").split("::");
    const mediaType = parseInt(rawType, 10) || 1;
    const params = buildSSParams({ id, type: mediaType });
    const res = await axios.get(`${SS_API2}/api/v1/movie/detail`, {
      params,
      headers: SS_HEADERS,
      signal
    });
    const data = res.data?.data || {};
    const title = data.title || "";
    const image = data.poster_org || data.poster || "";
    const synopsis = data.description || data.plot || "";
    const type = mediaType === 2 ? "series" : "movie";
    const rating = data.score ? String(data.score) : data.imdb_score ? String(data.imdb_score) : void 0;
    const tags = (data.cats || "").split(",").map((t) => t.trim()).filter(Boolean);
    const cast = (data.starring || "").split(",").map((c) => c.trim()).filter(Boolean);
    const linkList = [];
    if (type === "movie") {
      linkList.push({
        title: "Watch Movie",
        directLinks: [{
          title: "Play",
          link: `superstream-play://${id}::${mediaType}::0::0`,
          type: "movie"
        }]
      });
    } else {
      const seasons = data.season_info || data.seasons || [];
      for (const season of seasons) {
        const sNum = season.season || season.number;
        const eps = (season.episode || []).map((ep) => ({
          title: `E${ep.episode}: ${ep.title || ""}`.trim(),
          link: `superstream-play://${id}::${mediaType}::${sNum}::${ep.episode}::${ep.id}`,
          type: "series",
          description: ep.description || void 0
        }));
        linkList.push({ title: `Season ${sNum}`, directLinks: eps });
      }
    }
    return { title, image, synopsis, type, rating, tags, cast, linkList, populateMeta: true };
  }
  async function getStream({
    link,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const streams = [];
    const parts = link.replace("superstream-play://", "").split("::");
    const showId = parts[0];
    const mediaType = parseInt(parts[1], 10);
    const season = parseInt(parts[2], 10);
    const episode = parseInt(parts[3], 10);
    const epId = parts[4] || showId;
    const params = buildSSParams(
      mediaType === 1 ? { id: showId } : { id: showId, season, episode, childid: epId }
    );
    const res = await axios.get(`${SS_API2}/api/v1/${mediaType === 1 ? "movie" : "episode"}/playinfo`, {
      params,
      headers: SS_HEADERS,
      signal
    });
    const data = res.data?.data || {};
    const addLinks = (list, server) => {
      for (const item of list) {
        const url = item.url || item.path || "";
        if (!url)
          continue;
        streams.push({
          server: `SuperStream ${server} ${item.quality || item.definition || ""}`.trim(),
          link: url,
          type: url.includes(".m3u8") ? "m3u8" : url.includes(".mpd") ? "mpd" : "mp4",
          quality: item.quality || item.definition || void 0
        });
      }
    };
    addLinks(data.list || [], "");
    addLinks(data.hls || [], "HLS");
    addLinks(data.download || [], "Download");
    return streams;
  }
  var SuperStreamProvider = {
    catalog,
    genres: catalog.slice(3),
    searchFilter: "keyword",
    GetHomePage: getPosts,
    GetSearchPosts: getSearchPosts,
    GetInfo: getMeta,
    GetStream: getStream
  };
  return __toCommonJS(superStream_exports);
})();
