const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const providersDir = path.join(__dirname, "providers");
const providerDirs = fs
  .readdirSync(providersDir, { withFileTypes: true })
  .filter(
    (dirent) =>
      dirent.isDirectory() &&
      !dirent.name.startsWith(".") &&
      dirent.name !== "extractors",
  )
  .map((dirent) => dirent.name);

console.log(`Found ${providerDirs.length} providers to build:`, providerDirs);

async function buildProvider(providerName) {
  const providerPath = path.join(providersDir, providerName);
  const distPath = path.join(__dirname, "dist", providerName);

  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }

  const modules = ["catalog", "posts", "meta", "stream", "episodes", "settings"];

  for (const moduleName of modules) {
    const modulePath = path.join(providerPath, `${moduleName}.ts`);
    if (!fs.existsSync(modulePath)) continue;

    try {
      await esbuild.build({
        entryPoints: [modulePath],
        bundle: true,
        platform: "node",
        format: "cjs",
        target: "es2015",
        minify: false,
        keepNames: true,
        outfile: path.join(distPath, `${moduleName}.js`),
      });
      console.log(`✅  Built ${providerName}/${moduleName}.js`);
    } catch (err) {
      console.error(`❌ Failed ${providerName}/${moduleName}:`, err.message);
    }
  }

  // Also build standalone single-file bundle in dist/
  const indexPath = path.join(providerPath, "index.ts");
  if (fs.existsSync(indexPath)) {
    try {
      await esbuild.build({
        entryPoints: [indexPath],
        bundle: true,
        platform: "browser",
        target: "es2020",
        format: "iife",
        globalName: `VegaProvider_${providerName}`,
        outfile: path.join(__dirname, "dist", `${providerName}.js`),
      });
      console.log(`✅  Built standalone dist/${providerName}.js`);
    } catch (err) {
      console.error(`❌ Failed standalone ${providerName}:`, err.message);
    }
  }
}

async function main() {
  for (const p of providerDirs) {
    await buildProvider(p);
  }

  // Copy manifest to dist/
  fs.copyFileSync(
    path.join(__dirname, "manifest.json"),
    path.join(__dirname, "dist", "manifest.json"),
  );
  console.log("\n📦 All modules and manifest built successfully in dist/!");
}

main().catch(console.error);
