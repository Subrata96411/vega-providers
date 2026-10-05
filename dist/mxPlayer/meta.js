"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var getMeta = /* @__PURE__ */ __name(function(_0) {
  return __async(this, arguments, function* ({
    link
  }) {
    let parsed = {};
    try {
      parsed = JSON.parse(link);
    } catch (e) {
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
  });
}, "getMeta");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getMeta
});
