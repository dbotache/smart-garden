/**
 * Lists every file under public/assets with its size, and reports assets that are never referenced
 * from src/ (candidates for removal) and references in src/ that point to missing files.
 *   npm run inspect-assets
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const pub = path.join(root, "public");

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

const assets = walk(path.join(pub, "assets")).map((f) => "/" + path.relative(pub, f).split(path.sep).join("/"));
const sources = walk(path.join(root, "src")).filter((f) => /\.(tsx?|css)$/.test(f));
const code = sources.map((f) => fs.readFileSync(f, "utf8")).join("\n");

// icon references are built as `/assets/icons/${icon}.png` → expand IconName usages
const iconNames = new Set([...code.matchAll(/icon[=:]\s*"([a-z-]+)"/g)].map((m) => m[1]));
const referenced = new Set([...code.matchAll(/["'`](\/assets\/[^"'`$]+)["'`]/g)].map((m) => m[1]!));
for (const n of iconNames) referenced.add(`/assets/icons/${n}.png`);

console.log("Assets in public/assets:");
for (const a of assets) {
  const kb = (fs.statSync(path.join(pub, a)).size / 1024).toFixed(1).padStart(7);
  console.log(`  ${kb} KB  ${a}${referenced.has(a) ? "" : "   (unreferenced)"}`);
}
const missing = [...referenced].filter((r) => !assets.includes(r));
if (missing.length) {
  console.error("\nMissing assets referenced from src/:\n  " + missing.join("\n  "));
  process.exit(1);
}
console.log(`\n${assets.length} assets, ${referenced.size} referenced, none missing.`);
