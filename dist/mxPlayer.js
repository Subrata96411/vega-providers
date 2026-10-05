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
    MXPlayerProvider: () => MXPlayerProvider
  });

  // providers/mxPlayer/catalog.ts
  var catalog = [
    { title: "Hindi Web Series", filter: "genreFilterIds=48efa872f6f17facebf6149dfc536ee1&type=2" },
    { title: "All Web Series", filter: "type=2" },
    { title: "Hindi Movies", filter: "browseLangFilterIds=hi&type=1" },
    { title: "Trending Movies", filter: "type=1" },
    { title: "Action Movies", filter: "genreFilterIds=7fa3e873a6e48291f69e9fae2a7c1f38&type=1" },
    { title: "Drama Shows", filter: "genreFilterIds=b413dff55bdad743c577a8bea3b65044&type=2" },
    { title: "Crime Shows", filter: "genreFilterIds=48efa872f6f17facebf6149dfc536ee1&type=2" },
    { title: "Comedy Movies", filter: "genreFilterIds=2e3c42ebf0cd77059fc5f6b8e72d5892&type=1" },
    { title: "Telugu (Hindi Dub)", filter: "browseLangFilterIds=te&type=1" },
    { title: "Tamil (Hindi Dub)", filter: "browseLangFilterIds=ta&type=1" }
  ];

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

  // providers/mxPlayer/posts.ts
  var WEB_API = "https://api.mxplayer.in/v1/web";
  var IMAGE_CDN = "https://qqcdnpictest.mxplay.com";
  var MAIN_URL = "https://www.mxplayer.in";
  function getBestThumbnail(item) {
    const infoList = item.imageInfo || [];
    const pLarge = infoList.find((x) => x.type === "portrait_large");
    if (pLarge?.url)
      return `${IMAGE_CDN}/${pLarge.url.replace(/^\/+/, "")}`;
    const portrait = infoList.find((x) => x.type === "portrait");
    if (portrait?.url)
      return `${IMAGE_CDN}/${portrait.url.replace(/^\/+/, "")}`;
    const landscape = infoList.find((x) => x.type === "landscape" || x.type === "bigpic");
    if (landscape?.url)
      return `${IMAGE_CDN}/${landscape.url.replace(/^\/+/, "")}`;
    if (item.thumbnailUrl) {
      return item.thumbnailUrl.startsWith("http") ? item.thumbnailUrl : `${IMAGE_CDN}/${item.thumbnailUrl.replace(/^\/+/, "")}`;
    }
    return "https://www.mxplayer.in/favicon.ico";
  }
  var getPosts = async function({
    filter,
    page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const queryFilter = filter || "type=2";
    const url = `${WEB_API}/detail/browseItem?pageNum=${page}&pageSize=20&isCustomized=true&${queryFilter}&device-density=2&platform=com.mxplay.desktop&content-languages=hi,en&kids-mode-enabled=false`;
    const res = await axios.get(url, {
      headers: { ...commonHeaders, Referer: `${MAIN_URL}/` },
      signal
    });
    const items = res.data?.items ?? [];
    return items.map((item) => {
      const isTvShow = item.type === "tvshow" || item.type === 2 || !item.stream;
      const itemType = isTvShow ? "series" : "movie";
      const hls = item.stream?.thirdParty?.hlsUrl || item.stream?.hls?.high || item.stream?.hls?.base || item.stream?.hls?.main;
      const thumbnail = getBestThumbnail(item);
      return {
        title: item.title || item.name || "",
        link: JSON.stringify({
          id: item.id,
          title: item.title,
          type: itemType,
          shareUrl: item.shareUrl || `/detail/${isTvShow ? "tvshow" : "movie"}/${item.id}`,
          hls: hls || null,
          description: item.description || "",
          rating: item.rating ? String(item.rating) : "",
          image: thumbnail
        }),
        image: thumbnail,
        tag: isTvShow ? "Series" : "Movie",
        cornerTag: item.languages?.[0] || void 0
      };
    });
  };
  var getSearchPosts = async function({
    searchQuery,
    page,
    signal,
    providerContext
  }) {
    const { axios } = providerContext;
    const url = `${WEB_API}/search/result?query=${encodeURIComponent(searchQuery)}&pageNum=${page}&pageSize=20&device-density=2&platform=com.mxplay.desktop&content-languages=hi,en&kids-mode-enabled=false`;
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
        const isTvShow = sec.name?.toLowerCase().includes("show") || item.type === "tvshow" || !item.stream;
        const itemType = isTvShow ? "series" : "movie";
        const hls = item.stream?.thirdParty?.hlsUrl || item.stream?.hls?.high || item.stream?.hls?.base;
        const thumbnail = getBestThumbnail(item);
        posts.push({
          title: item.title || "",
          link: JSON.stringify({
            id: item.id,
            title: item.title,
            type: itemType,
            shareUrl: item.shareUrl || `/detail/${isTvShow ? "tvshow" : "movie"}/${item.id}`,
            hls: hls || null,
            description: item.description || "",
            rating: item.rating ? String(item.rating) : "",
            image: thumbnail
          }),
          image: thumbnail,
          tag: sec.name || (isTvShow ? "Series" : "Movie")
        });
      }
    }
    return posts;
  };

  // providers/mxPlayer/meta.ts
  var MAIN_URL2 = "https://www.mxplayer.in";
  var WEB_API2 = "https://api.mxplayer.in/v1/web";
  var CDN = "https://d3sgzbosmwirao.cloudfront.net";
  var IMAGE_CDN2 = "https://qqcdnpictest.mxplay.com";
  var getMeta = async function({
    link,
    providerContext
  }) {
    const { axios, cheerio } = providerContext;
    let parsed = {};
    try {
      parsed = JSON.parse(link);
    } catch {
      parsed = { id: link, type: "movie", title: "Video" };
    }
    const isSeries = parsed.type === "series" || parsed.shareUrl?.includes("tvshow");
    const linkList = [];
    if (isSeries) {
      try {
        const showPageUrl = `${MAIN_URL2}${parsed.shareUrl || `/detail/tvshow/${parsed.id}`}`;
        const pageRes = await axios.get(showPageUrl, {
          headers: { ...commonHeaders, Referer: `${MAIN_URL2}/` }
        });
        const $ = cheerio.load(pageRes.data);
        const seasonTabs = [];
        $("div.hs__items-container > div").each((_, el) => {
          const text = $(el).text().trim() || "";
          const dataId = $(el).attr("data-id") || "";
          const dataTab = $(el).attr("data-tab") || "";
          const seasonNum = parseInt(dataTab, 10) || (text.match(/Season\s*(\d+)/i) ? parseInt(text.match(/Season\s*(\d+)/i)[1], 10) : 1);
          if (dataId) {
            seasonTabs.push({
              seasonNum,
              seasonId: dataId,
              title: text || `Season ${seasonNum}`
            });
          }
        });
        if (seasonTabs.length === 0 && parsed.id) {
          seasonTabs.push({
            seasonNum: 1,
            seasonId: parsed.id,
            title: "Season 1"
          });
        }
        seasonTabs.sort((a, b) => a.seasonNum - b.seasonNum);
        for (const season of seasonTabs) {
          try {
            const epUrl = `${WEB_API2}/detail/tab/tvshowepisodes?type=season&id=${season.seasonId}&sortOrder=0&device-density=2&platform=com.mxplay.desktop`;
            const epRes = await axios.get(epUrl, {
              headers: { ...commonHeaders, Referer: `${MAIN_URL2}/` }
            });
            const items = epRes.data?.items || [];
            const directLinks = [];
            items.forEach((ep, idx) => {
              const hls = ep.stream?.thirdParty?.hlsUrl || ep.stream?.hls?.high || ep.stream?.hls?.base || ep.stream?.hls?.main;
              if (hls) {
                const fullUrl = hls.startsWith("http") ? hls : `${CDN}/${hls.replace(/^\/+/, "")}`;
                let image = "";
                const infoList = ep.imageInfo || [];
                const p = infoList.find(
                  (x) => x.type === "portrait_large" || x.type === "portrait" || x.type === "landscape" || x.type === "bigpic"
                );
                if (p?.url) {
                  image = `${IMAGE_CDN2}/${p.url.replace(/^\/+/, "")}`;
                }
                directLinks.push({
                  title: ep.title ? `E${idx + 1}: ${ep.title}` : `Episode ${idx + 1}`,
                  link: fullUrl,
                  type: "series",
                  description: ep.description || void 0,
                  image: image || void 0
                });
              }
            });
            linkList.push({
              title: season.title,
              episodesLink: JSON.stringify({
                seasonId: season.seasonId,
                seasonNum: season.seasonNum,
                title: season.title
              }),
              directLinks: directLinks.length > 0 ? directLinks : void 0
            });
          } catch {
            linkList.push({
              title: season.title,
              episodesLink: JSON.stringify({
                seasonId: season.seasonId,
                seasonNum: season.seasonNum,
                title: season.title
              })
            });
          }
        }
      } catch {
      }
    }
    if (linkList.length === 0) {
      const streamLink = parsed.hls ? parsed.hls.startsWith("http") ? parsed.hls : `${CDN}/${parsed.hls.replace(/^\/+/, "")}` : `${CDN}/video/${parsed.id}/2/hls/h264_high.m3u8`;
      linkList.push({
        title: "Watch",
        directLinks: [
          {
            title: "Play Movie",
            link: streamLink,
            type: "movie"
          }
        ]
      });
    }
    return {
      title: parsed.title || "MX Player",
      image: parsed.image || "",
      synopsis: parsed.description || "",
      type: isSeries ? "series" : "movie",
      rating: parsed.rating || void 0,
      linkList
    };
  };

  // providers/mxPlayer/stream.ts
  var getStream = async function({
    link
  }) {
    const streamUrl = link.startsWith("http") ? link : `https://d3sgzbosmwirao.cloudfront.net/${link}`;
    return [
      {
        server: "MX Player CloudFront HLS",
        link: streamUrl,
        type: "m3u8",
        headers: {
          Referer: "https://www.mxplayer.in/",
          Origin: "https://www.mxplayer.in"
        }
      }
    ];
  };

  // providers/mxPlayer/episodes.ts
  var WEB_API3 = "https://api.mxplayer.in/v1/web";
  var IMAGE_CDN3 = "https://qqcdnpictest.mxplay.com";
  var CDN2 = "https://d3sgzbosmwirao.cloudfront.net";
  var MAIN_URL3 = "https://www.mxplayer.in";
  var getEpisodes = async function({
    url,
    providerContext
  }) {
    const { axios } = providerContext;
    let seasonId = url;
    try {
      const parsed = JSON.parse(url);
      seasonId = parsed.seasonId || parsed.id || url;
    } catch {
    }
    try {
      const epUrl = `${WEB_API3}/detail/tab/tvshowepisodes?type=season&id=${seasonId}&sortOrder=0&device-density=2&platform=com.mxplay.desktop`;
      const epRes = await axios.get(epUrl, {
        headers: { ...commonHeaders, Referer: `${MAIN_URL3}/` }
      });
      const items = epRes.data?.items || [];
      const episodes = [];
      items.forEach((ep, idx) => {
        const hls = ep.stream?.thirdParty?.hlsUrl || ep.stream?.hls?.high || ep.stream?.hls?.base || ep.stream?.hls?.main;
        if (hls) {
          const fullUrl = hls.startsWith("http") ? hls : `${CDN2}/${hls.replace(/^\/+/, "")}`;
          let image = "";
          const infoList = ep.imageInfo || [];
          const p = infoList.find(
            (x) => x.type === "portrait_large" || x.type === "portrait" || x.type === "landscape" || x.type === "bigpic"
          );
          if (p?.url) {
            image = `${IMAGE_CDN3}/${p.url.replace(/^\/+/, "")}`;
          }
          episodes.push({
            title: ep.title ? `E${idx + 1}: ${ep.title}` : `Episode ${idx + 1}`,
            link: fullUrl,
            description: ep.description || void 0,
            image: image || void 0
          });
        }
      });
      return episodes;
    } catch (err) {
      return [];
    }
  };

  // providers/mxPlayer/index.ts
  var MXPlayerProvider = {
    catalog,
    genres: catalog.slice(2),
    searchFilter: "query",
    GetHomePage: getPosts,
    GetSearchPosts: getSearchPosts,
    GetInfo: getMeta,
    GetStream: getStream,
    GetEpisodeLinks: getEpisodes
  };
  return __toCommonJS(mxPlayer_exports);
})();
