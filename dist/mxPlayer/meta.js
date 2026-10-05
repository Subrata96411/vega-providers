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

// providers/mxPlayer/meta.ts
var meta_exports = {};
__export(meta_exports, {
  getMeta: () => getMeta
});
module.exports = __toCommonJS(meta_exports);

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

// providers/mxPlayer/meta.ts
var MAIN_URL = "https://www.mxplayer.in";
var WEB_API = "https://api.mxplayer.in/v1/web";
var CDN = "https://d3sgzbosmwirao.cloudfront.net";
var getMeta = /* @__PURE__ */ __name(function(_0) {
  return __async(this, arguments, function* ({
    link,
    providerContext
  }) {
    var _a, _b;
    const { axios, cheerio } = providerContext;
    let parsed = {};
    try {
      parsed = JSON.parse(link);
    } catch (e) {
      parsed = { id: link, type: "movie", title: "Video" };
    }
    const isSeries = parsed.type === "series" || ((_a = parsed.shareUrl) == null ? void 0 : _a.includes("tvshow"));
    const linkList = [];
    if (isSeries) {
      try {
        const showPageUrl = `${MAIN_URL}${parsed.shareUrl || `/detail/tvshow/${parsed.id}`}`;
        const pageRes = yield axios.get(showPageUrl, {
          headers: __spreadProps(__spreadValues({}, commonHeaders), { Referer: `${MAIN_URL}/` })
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
        seasonTabs.sort((a, b) => a.seasonNum - b.seasonNum);
        for (const season of seasonTabs) {
          try {
            const epUrl = `${WEB_API}/detail/tab/tvshowepisodes?type=season&id=${season.seasonId}&sortOrder=0&device-density=2&platform=com.mxplay.desktop`;
            const epRes = yield axios.get(epUrl, {
              headers: __spreadProps(__spreadValues({}, commonHeaders), { Referer: `${MAIN_URL}/` })
            });
            const items = ((_b = epRes.data) == null ? void 0 : _b.items) || [];
            const directLinks = [];
            items.forEach((ep, idx) => {
              var _a2, _b2, _c, _d, _e, _f, _g, _h;
              const hls = ((_b2 = (_a2 = ep.stream) == null ? void 0 : _a2.thirdParty) == null ? void 0 : _b2.hlsUrl) || ((_d = (_c = ep.stream) == null ? void 0 : _c.hls) == null ? void 0 : _d.high) || ((_f = (_e = ep.stream) == null ? void 0 : _e.hls) == null ? void 0 : _f.base) || ((_h = (_g = ep.stream) == null ? void 0 : _g.hls) == null ? void 0 : _h.main);
              if (hls) {
                const fullUrl = hls.startsWith("http") ? hls : `${CDN}/${hls.replace(/^\/+/, "")}`;
                directLinks.push({
                  title: ep.title ? `E${idx + 1}: ${ep.title}` : `Episode ${idx + 1}`,
                  link: fullUrl,
                  type: "series",
                  description: ep.description || void 0
                });
              }
            });
            if (directLinks.length > 0) {
              linkList.push({
                title: season.title,
                directLinks
              });
            }
          } catch (e) {
          }
        }
      } catch (e) {
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
  });
}, "getMeta");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getMeta
});
