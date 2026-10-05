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

// providers/movieBox/episodes.ts
var episodes_exports = {};
__export(episodes_exports, {
  getEpisodes: () => getEpisodes
});
module.exports = __toCommonJS(episodes_exports);

// providers/movieBox/utils.ts
function encodeLink(value) {
  return JSON.stringify(value);
}
__name(encodeLink, "encodeLink");
function decodeLink(value) {
  return JSON.parse(value);
}
__name(decodeLink, "decodeLink");

// providers/providerErrors.ts
function throwProviderError(provider, action, error) {
  console.error(`[${provider}] Error during ${action}:`, (error == null ? void 0 : error.message) || error);
  throw error;
}
__name(throwProviderError, "throwProviderError");

// providers/movieBox/episodes.ts
var getEpisodes = /* @__PURE__ */ __name(function(_0) {
  return __async(this, arguments, function* ({
    url
  }) {
    var _a, _b;
    try {
      const playback = decodeLink(url);
      const episodes = [];
      for (const season of playback.seasons || []) {
        const seasonNumber = season.se || 1;
        const availableEpisodes = season.allEp ? season.allEp.split(",").map(Number).filter((episode) => episode > 0) : Array.from({ length: season.maxEp || 0 }, (_, index) => index + 1);
        for (const episode of availableEpisodes) {
          const resolution = (_b = (_a = season.resolutions) == null ? void 0 : _a.filter((item) => (item.epNum || 0) >= episode).sort(
            (a, b) => (b.resolution || 0) - (a.resolution || 0)
          )[0]) == null ? void 0 : _b.resolution;
          episodes.push({
            title: `S${String(seasonNumber).padStart(2, "0")} E${String(episode).padStart(2, "0")}`,
            link: encodeLink(__spreadProps(__spreadValues({}, playback), {
              seasons: void 0,
              season: seasonNumber,
              episode,
              resolution
            }))
          });
        }
      }
      return episodes;
    } catch (error) {
      throwProviderError("MovieBox Web", "episodes", error);
    }
  });
}, "getEpisodes");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getEpisodes
});
