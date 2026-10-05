# vega-phisher-providers

> **Curated Vega extensions ported from phisher98 — MovieBox & MX Player**

Streamlined, high-performance providers crafted specifically for [vega-app](https://github.com/vega-org/vega-app).

---

## 📦 Included Providers

| Provider | Type | Description |
|---|---|---|
| **MovieBox** | Global | Movies & Web Series worldwide via MovieBox official web API |
| **MX Player** | Indian | Hindi movies, dramas & web series via official MX Player API |

---

## 🚀 Quick Start

### 1. In vega-app (Direct Add)

1. Open **vega-app** on your device.
2. Go to **Settings ➔ Provider Manager ➔ Available Providers ➔ +**.
3. Paste the URL pointing to `manifest.json`:
   ```
   https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/manifest.json
   ```

### 2. Local Development & Testing

```bash
# Install dependencies
npm install

# Start local server (port 4000)
npm run dev:server

# Build production bundles
npm run build
```

---

## 🗂 Project Structure

```
vega-phisher/
├── manifest.json              # Provider registry (MovieBox & MX Player)
├── build-bundled.js           # Production esbuild bundler
├── dev-server.js              # Hot-reload local server
├── providers/
│   ├── types.ts               # Core Vega API types
│   ├── headers.ts             # Shared User-Agent and headers
│   ├── getBaseUrl.ts          # Resilient domain resolver
│   ├── index.ts               # Providers barrel export
│   ├── movieBox/              # MovieBox provider source
│   └── mxPlayer/              # MX Player provider source
└── dist/
    ├── manifest.json          # Production manifest
    ├── movieBox.js (.map)     # Bundled MovieBox
    └── mxPlayer.js (.map)     # Bundled MX Player
```
