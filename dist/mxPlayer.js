"use strict";
var VegaProvider_mxPlayer = (() => {
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

  // providers/mxPlayer/index.ts
  var mxPlayer_exports = {};
  __export(mxPlayer_exports, {
    MXPlayerProvider: () => MXPlayerProvider,
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

  // providers/mxPlayer/index.ts
  var catalog = [
    { title: "Hindi Movies", filter: "hindi_movies" },
    { title: "Hindi Web Series", filter: "hindi_web_series" },
    { title: "Drama", filter: "drama" },
    { title: "Crime", filter: "crime" },
    { title: "Thriller", filter: "thriller" },
    { title: "Action", filter: "action" }
  ];
  var WEB_API = "https://api.mxplayer.in/v1/web";
  var IMAGE_CDN = "https://qqcdnpictest.mxplay.com";
  var MAIN_URL = "https://www.mxplayer.in";
  var GENRE_IDS = {
    drama: "b413dff55bdad743c577a8bea3b65044",
    crime: "48efa872f6f17facebf6149dfc536ee1",
    thriller: "48efa872f6f17facebf6149dfc536ee1",
    action: "7fa3e873a6e48291f69e9fae2a7c1f38"
  };
  var FILTER_TYPE = {
    hindi_movies: { type: 1 },
    // Type 1 = Movies with direct streams
    hindi_web_series: { type: 2 }
  };
  var _userId = null;
  function getEndParam(userId) {
    return `&device-density=2&userid=${userId || ""}&platform=com.mxplay.desktop&content-languages=hi,en&kids-mode-enabled=false`;
  }
  async function ensureUserId(axios) {
    if (_userId)
      return _userId;
    try {
      const res = await axios.get(MAIN_URL, { headers: commonHeaders });
      const cookies = res.headers?.["set-cookie"]?.join(";") || "";
      const match = cookies.match(/UserID=([^;]+)/);
      _userId = match?.[1] ?? null;
    } catch {
      _userId = null;
    }
    return _userId;
  }
  function buildImageUrl(path) {
    if (!path)
      return "";
    if (path.startsWith("http"))
      return path;
    return `${IMAGE_CDN}${path}`;
  }
  async function getPosts({
    filter,
    page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const userId = await ensureUserId(axios);
    const genreId = GENRE_IDS[filter];
    const typeInfo = FILTER_TYPE[filter];
    const type = typeInfo?.type ?? 1;
    const url = `${WEB_API}/detail/browseItem?&pageNum=${page}&pageSize=20&isCustomized=true${genreId ? `&genreFilterIds=${genreId}` : ""}&type=${type}${getEndParam(userId)}`;
    const res = await axios.get(url, {
      headers: { ...commonHeaders, Referer: `${MAIN_URL}/` },
      signal
    });
    const items = res.data?.items ?? [];
    return items.map((item) => {
      const hls = item.stream?.thirdParty?.hlsUrl || item.stream?.hls?.high || item.stream?.hls?.base;
      const itemType = item.type === "movie" ? "movie" : "series";
      return {
        title: item.title || item.name || "",
        link: JSON.stringify({
          id: item.id,
          type: itemType,
          title: item.title,
          hls: hls || null,
          shareUrl: item.shareUrl
        }),
        image: buildImageUrl(item.imageInfo?.find((x) => x.type === "portrait_large")?.url || item.thumbnailUrl || ""),
        provider: "mxPlayer",
        tag: itemType === "movie" ? "Movie" : "Series",
        cornerTag: item.languages?.[0] || void 0
      };
    });
  }
  async function getSearchPosts({
    searchQuery,
    page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const userId = await ensureUserId(axios);
    const url = `${WEB_API}/search/result?query=${encodeURIComponent(searchQuery)}&pageNum=${page}&pageSize=20${getEndParam(userId)}`;
    const res = await axios.get(url, {
      headers: { ...commonHeaders, Referer: `${MAIN_URL}/` },
      signal
    });
    const posts = [];
    const sections = res.data?.sections || [];
    for (const sec of sections) {
      const items = sec.items || [];
      for (const item of items) {
        if (!item?.id || !item?.title)
          continue;
        const hls = item.stream?.thirdParty?.hlsUrl || item.stream?.hls?.high || item.stream?.hls?.base;
        const itemType = item.type === "movie" ? "movie" : "series";
        posts.push({
          title: item.title || "",
          link: JSON.stringify({
            id: item.id,
            type: itemType,
            title: item.title,
            hls: hls || null,
            shareUrl: item.shareUrl
          }),
          image: buildImageUrl(item.imageInfo?.find((x) => x.type === "portrait_large")?.url || item.thumbnailUrl || ""),
          provider: "mxPlayer",
          tag: sec.name || void 0
        });
      }
    }
    return posts;
  }
  async function getMeta({
    link,
    signal: _signal,
    providerContext: _providerContext
  }) {
    let parsed = {};
    try {
      parsed = JSON.parse(link);
    } catch {
      parsed = { id: link, type: "movie", title: "Video" };
    }
    const directLinks = [];
    if (parsed.hls) {
      directLinks.push({
        title: "Play Movie (HLS)",
        link: parsed.hls,
        type: "movie"
      });
    } else {
      directLinks.push({
        title: "Play Stream",
        link: `https://d3sgzbosmwirao.cloudfront.net/video/${parsed.id}/2/hls/h264_high.m3u8`,
        type: "movie"
      });
    }
    return {
      title: parsed.title || "MX Player",
      image: "",
      synopsis: "",
      type: parsed.type || "movie",
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
    const streamUrl = link.startsWith("http") ? link : `https://d3sgzbosmwirao.cloudfront.net/${link}`;
    streams.push({
      server: "MX Player CloudFront HLS",
      link: streamUrl,
      type: "m3u8",
      headers: {
        Referer: "https://www.mxplayer.in/",
        Origin: "https://www.mxplayer.in"
      }
    });
    return streams;
  }
  var MXPlayerProvider = {
    catalog,
    genres: catalog.slice(2),
    searchFilter: "query",
    GetHomePage: getPosts,
    GetSearchPosts: getSearchPosts,
    GetInfo: getMeta,
    GetStream: getStream
  };
  return __toCommonJS(mxPlayer_exports);
})();
