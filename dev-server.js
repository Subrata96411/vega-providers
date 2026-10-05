/**
 * dev-server.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Local dev server that hot-serves each provider over HTTP so you can point
 * vega-app at  http://<your-machine-ip>:4000  during development.
 *
 * Usage:  node dev-server.js
 *         (or) npm run dev:server
 */

const express  = require('express');
const path     = require('path');
const fs       = require('fs');
const esbuild  = require('esbuild');

const manifest = require('./manifest.json');
const PORT     = process.env.PORT || 4000;
const app      = express();

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// ── Serve manifest ──────────────────────────────────────────────────────────
app.get('/manifest.json', (_req, res) => {
  res.json(manifest);
});

// ── On-the-fly transpile & serve each provider ──────────────────────────────
for (const provider of manifest) {
  const entryPoint = path.join(__dirname, 'providers', provider.value, 'index.ts');

  app.get(`/${provider.value}.js`, async (_req, res) => {
    if (!fs.existsSync(entryPoint)) {
      return res.status(404).send(`Provider ${provider.value} not found`);
    }
    try {
      const result = await esbuild.build({
        entryPoints:  [entryPoint],
        bundle:       true,
        write:        false,
        platform:     'browser',
        target:       'es2020',
        format:       'iife',
        globalName:   `VegaProvider_${provider.value}`,
        external:     [],
        sourcemap:    'inline',
        define: { 'process.env.NODE_ENV': '"development"' },
      });

      const code = result.outputFiles?.[0]?.text ?? '';
      res.header('Content-Type', 'application/javascript');
      res.send(code);
    } catch (err) {
      console.error(`Build error for ${provider.value}:`, err.message);
      res.status(500).send(`// Build failed: ${err.message}`);
    }
  });

  console.log(`🔌  Registered /${provider.value}.js`);
}

app.listen(PORT, () => {
  console.log(`\n🚀  vega-phisher dev server running at http://localhost:${PORT}`);
  console.log(`    Add this URL in vega-app → Settings → Provider Manager\n`);
});
