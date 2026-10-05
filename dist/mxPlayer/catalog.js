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

// providers/mxPlayer/catalog.ts
var catalog_exports = {};
__export(catalog_exports, {
  catalog: () => catalog
});
module.exports = __toCommonJS(catalog_exports);
var catalog = [
  { title: "Hindi Movies", filter: "hindi_movies" },
  { title: "Hindi Web Series", filter: "hindi_web_series" },
  { title: "Drama", filter: "drama" },
  { title: "Crime", filter: "crime" },
  { title: "Thriller", filter: "thriller" },
  { title: "Action", filter: "action" }
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  catalog
});
