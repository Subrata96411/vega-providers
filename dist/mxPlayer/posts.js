"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// providers/mxPlayer/posts.ts
var posts_exports = {};
__export(posts_exports, {
  getPosts: () => getPosts,
  getSearchPosts: () => getSearchPosts
});
module.exports = __toCommonJS(posts_exports);

// providers/headers.ts
var commonHeaders = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.google.com/"
};
var mobileHeaders = __spreadProps(__spreadValues({}, commonHeaders), {
  "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36"
});

// providers/mxPlayer/posts.ts
var WEB_API = "https://api.mxplayer.in/v1/web";
var IMAGE_CDN = "https://qqcdnpictest.mxplay.com";
var MAIN_URL = "https://www.mxplayer.in";
function getBestThumbnail(item) {
  const infoList = item.imageInfo || [];
  const pLarge = infoList.find((x) => x.type === "portrait_large");
  if (pLarge == null ? void 0 : pLarge.url)
    return `${IMAGE_CDN}/${pLarge.url.replace(/^\/+/, "")}`;
  const portrait = infoList.find((x) => x.type === "portrait");
  if (portrait == null ? void 0 : portrait.url)
    return `${IMAGE_CDN}/${portrait.url.replace(/^\/+/, "")}`;
  const landscape = infoList.find((x) => x.type === "landscape" || x.type === "bigpic");
  if (landscape == null ? void 0 : landscape.url)
    return `${IMAGE_CDN}/${landscape.url.replace(/^\/+/, "")}`;
  if (item.thumbnailUrl) {
    return item.thumbnailUrl.startsWith("http") ? item.thumbnailUrl : `${IMAGE_CDN}/${item.thumbnailUrl.replace(/^\/+/, "")}`;
  }
  return "https://www.mxplayer.in/favicon.ico";
}
__name(getBestThumbnail, "getBestThumbnail");
var getPosts = /* @__PURE__ */ __name(function(_0) {
  return __async(this, arguments, function* ({
    filter,
    page,
    signal,
    providerContext
  }) {
    var _a, _b;
    const { axios } = providerContext;
    const queryFilter = filter || "browseLangFilterIds=hi&type=1";
    const url = `${WEB_API}/detail/browseItem?pageNum=${page}&pageSize=20&isCustomized=true&${queryFilter}&device-density=2&platform=com.mxplay.desktop&content-languages=hi,en&kids-mode-enabled=false`;
    const res = yield axios.get(url, {
      headers: __spreadProps(__spreadValues({}, commonHeaders), { Referer: `${MAIN_URL}/` }),
      signal
    });
    const items = (_b = (_a = res.data) == null ? void 0 : _a.items) != null ? _b : [];
    return items.map((item) => {
      var _a2, _b2, _c, _d, _e, _f, _g, _h, _i;
      const hls = ((_b2 = (_a2 = item.stream) == null ? void 0 : _a2.thirdParty) == null ? void 0 : _b2.hlsUrl) || ((_d = (_c = item.stream) == null ? void 0 : _c.hls) == null ? void 0 : _d.high) || ((_f = (_e = item.stream) == null ? void 0 : _e.hls) == null ? void 0 : _f.base) || ((_h = (_g = item.stream) == null ? void 0 : _g.hls) == null ? void 0 : _h.main);
      const thumbnail = getBestThumbnail(item);
      return {
        title: item.title || item.name || "",
        link: JSON.stringify({
          id: item.id,
          title: item.title,
          hls: hls || null,
          description: item.description || "",
          rating: item.rating ? String(item.rating) : "",
          image: thumbnail
        }),
        image: thumbnail,
        tag: "Movie",
        cornerTag: ((_i = item.languages) == null ? void 0 : _i[0]) || void 0
      };
    });
  });
}, "getPosts");
var getSearchPosts = /* @__PURE__ */ __name(function(_0) {
  return __async(this, arguments, function* ({
    searchQuery,
    page,
    signal,
    providerContext
  }) {
    var _a, _b, _c, _d, _e, _f, _g;
    const { axios } = providerContext;
    const url = `${WEB_API}/search/result?query=${encodeURIComponent(searchQuery)}&pageNum=${page}&pageSize=20&device-density=2&platform=com.mxplay.desktop&content-languages=hi,en&kids-mode-enabled=false`;
    const res = yield axios.get(url, {
      headers: __spreadProps(__spreadValues({}, commonHeaders), { Referer: `${MAIN_URL}/` }),
      signal
    });
    const posts = [];
    const sections = ((_a = res.data) == null ? void 0 : _a.sections) || [];
    for (const sec of sections) {
      const items = sec.items || [];
      for (const item of items) {
        if (!(item == null ? void 0 : item.id) || !(item == null ? void 0 : item.title))
          continue;
        const hls = ((_c = (_b = item.stream) == null ? void 0 : _b.thirdParty) == null ? void 0 : _c.hlsUrl) || ((_e = (_d = item.stream) == null ? void 0 : _d.hls) == null ? void 0 : _e.high) || ((_g = (_f = item.stream) == null ? void 0 : _f.hls) == null ? void 0 : _g.base);
        const thumbnail = getBestThumbnail(item);
        posts.push({
          title: item.title || "",
          link: JSON.stringify({
            id: item.id,
            title: item.title,
            hls: hls || null,
            description: item.description || "",
            rating: item.rating ? String(item.rating) : "",
            image: thumbnail
          }),
          image: thumbnail,
          tag: sec.name || "Movie"
        });
      }
    }
    return posts;
  });
}, "getSearchPosts");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getPosts,
  getSearchPosts
});
