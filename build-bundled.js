const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const { minify } = require("terser");

const SKIP_MINIFY = process.env.SKIP_MINIFY === "true";

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
      const result = await esbuild.build({
        entryPoints: [modulePath],
        bundle: true,
        platform: "node",
        format: "cjs",
        target: "es2015",
        write: false,
        minify: false,
        keepNames: true,
        treeShaking: true,
        outfile: `${moduleName}.js`,
      });

      let code = result.outputFiles[0].text;

      // Post-process the code for React Native / Vega App compatibility
      code = code.replace(/require\(['"]node:.*?['"]\)/g, "{}");

      const exportMatch = code.match(/__export\((\w+),\s*\{([^}]+)\}\);/);

      if (exportMatch) {
        const exportsVar = exportMatch[1];
        const exportsContent = exportMatch[2];

        const exportEntries = exportsContent
          .split(",")
          .map((entry) => {
            const match = entry.trim().match(/(\w+):\s*\(\)\s*=>\s*(\w+)/);
            return match
              ? { exportName: match[1], localName: match[2] }
              : null;
          })
          .filter(Boolean);

        // Replace module.exports pattern
        code = code.replace(
          /module\.exports\s*=\s*__toCommonJS\((\w+)\);/g,
          "",
        );

        // Add direct exports assignments
        const directExports = exportEntries
          .map(
            ({ exportName, localName }) =>
              `exports.${exportName} = ${localName};`,
          )
          .join("\n");

        if (code.includes("// Annotate the CommonJS export names for ESM import in node:")) {
          code = code.replace(
            /\/\/ Annotate the CommonJS export names for ESM import in node:/,
            `${directExports}\n// Annotate the CommonJS export names for ESM import in node:`,
          );
        } else {
          code += `\n${directExports}\n`;
        }
      }

      // Also handle the "0 && (module.exports = {...})" pattern at the end
      code = code.replace(
        /0\s*&&\s*\(module\.exports\s*=\s*\{[^}]*\}\);?/g,
        "",
      );

      // Minify if not skipped
      if (!SKIP_MINIFY) {
        try {
          const minified = await minify(code, {
            compress: {
              drop_console: false,
              passes: 1,
              unsafe: false,
            },
            mangle: false, // Must not mangle function names for Vega App
            format: {
              comments: false,
            },
          });
          if (minified.code) {
            code = minified.code;
          }
        } catch (e) {
          console.warn(`Minification warning for ${providerName}/${moduleName}:`, e.message);
        }
      }

      const outputPath = path.join(distPath, `${moduleName}.js`);
      fs.writeFileSync(outputPath, code);
      console.log(`✅  Built ${providerName}/${moduleName}.js (${(code.length / 1024).toFixed(1)}kb)`);
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

async function buildUtilityFiles() {
  const utilityFiles = ["headers", "getBaseUrl"];
  const distDir = path.join(__dirname, "dist");
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  for (const utilityName of utilityFiles) {
    const utilityPath = path.join(providersDir, `${utilityName}.ts`);
    if (!fs.existsSync(utilityPath)) continue;

    try {
      const result = await esbuild.build({
        entryPoints: [utilityPath],
        bundle: true,
        platform: "node",
        format: "cjs",
        target: "es2015",
        write: false,
        outfile: `${utilityName}.js`,
      });

      let code = result.outputFiles[0].text;
      code = code.replace(/require\(['"]node:.*?['"]\)/g, "{}");
      fs.writeFileSync(path.join(distDir, `${utilityName}.js`), code);
      console.log(`✅  Built utility dist/${utilityName}.js`);
    } catch (err) {
      console.error(`❌ Failed utility ${utilityName}:`, err.message);
    }
  }
}

async function main() {
  await buildUtilityFiles();

  for (const p of providerDirs) {
    await buildProvider(p);
  }

  // Copy manifest to dist/ and root
  fs.copyFileSync(
    path.join(__dirname, "manifest.json"),
    path.join(__dirname, "dist", "manifest.json"),
  );
  console.log("\n📦 All modules and manifest built successfully in dist/!");
}

main().catch(console.error);
