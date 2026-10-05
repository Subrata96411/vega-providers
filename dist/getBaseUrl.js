"use strict";
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

// providers/getBaseUrl.ts
var getBaseUrl_exports = {};
__export(getBaseUrl_exports, {
  getBaseUrl: () => getBaseUrl
});
module.exports = __toCommonJS(getBaseUrl_exports);
var urlsEndpoint = "https://raw.githubusercontent.com/Zenda-Cross/vega-providers/refs/heads/main/urls.json";
var cacheTtl = 60 * 60 * 1e3;
function getCache() {
  var _a;
  const state = typeof providerGlobal !== "undefined" && providerGlobal ? providerGlobal : globalThis;
  (_a = state.__vegaProviderBaseUrlCache__) != null ? _a : state.__vegaProviderBaseUrlCache__ = { expiresAt: 0 };
  return state.__vegaProviderBaseUrlCache__;
}
var FALLBACK_DOMAINS = {
  hdhub: { url: "https://new1.hdhub4u.free" },
  kissKh: { url: "https://kisskh.is" },
  UhdMovies: { url: "https://uhdmovies.my" },
  kickAssAnime: { url: "https://kaa.lt" },
  movieBoxWeb: { url: "https://officialmoviebox.com" },
  movieBox: { url: "https://officialmoviebox.com" },
  showbox: { url: "https://www.showbox.media" }
};
function fetchProviderUrls() {
  return __async(this, null, function* () {
    const cache = getCache();
    if (cache.data && Date.now() < cache.expiresAt) {
      return cache.data;
    }
    if (cache.request) {
      return cache.request;
    }
    const request = fetch(urlsEndpoint).then((response) => __async(this, null, function* () {
      if (!response.ok) {
        throw new Error(`URL configuration request failed: ${response.status}`);
      }
      const data = yield response.json();
      cache.data = data;
      cache.expiresAt = Date.now() + cacheTtl;
      return data;
    })).catch((error) => {
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
  });
}
var getBaseUrl = (providerValue) => __async(void 0, null, function* () {
  var _a, _b, _c, _d, _e, _f;
  try {
    const providerUrls = yield fetchProviderUrls();
    return (_d = (_c = (_a = providerUrls[providerValue]) == null ? void 0 : _a.url) != null ? _c : (_b = FALLBACK_DOMAINS[providerValue]) == null ? void 0 : _b.url) != null ? _d : "";
  } catch (e) {
    return (_f = (_e = FALLBACK_DOMAINS[providerValue]) == null ? void 0 : _e.url) != null ? _f : "";
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getBaseUrl
});
