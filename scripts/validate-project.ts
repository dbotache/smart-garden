/**
 * Structural checks that unit tests don't cover well:
 *  - one SlideNN.tsx per registered slide, all registered, and all 9 PPTX slides mapped in order
 *  - the presentation imports the prototype and the architecture module ONLY through their public entries
 *  - no Math.random in prototype data/logic (tests and screenshots must be deterministic)
 *  - original inputs are preserved
 *   npm run validate
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const errors: string[] = [];
const ok = (msg: string) => console.log(`✓ ${msg}`);

const slideDir = path.join(root, "src/presentation/slides");
const files = fs.readdirSync(slideDir).filter((f) => /^Slide\d{2}\.tsx$/.test(f)).sort();
// Parse the registry source (importing it would pull React components + CSS into plain Node).
const index = fs.readFileSync(path.join(slideDir, "index.ts"), "utf8");
const entries = [...index.matchAll(/\{ id: "([^"]+)"[^]*?source: \{ type: "(pptx|new)"(?:, slide: (\d+))?/g)].map((m) => ({ id: m[1]!, type: m[2]!, slide: m[3] ? Number(m[3]) : undefined }));
for (const f of files) if (!index.includes(`from "./${f.replace(".tsx", "")}"`)) errors.push(`${f} is not registered in slides/index.ts`);
if (files.length !== entries.length) errors.push(`${files.length} slide files but ${entries.length} registry entries`);
else ok(`${files.length} slide files, each registered`);

const pptx = entries.filter((e) => e.type === "pptx").map((e) => e.slide);
if (pptx.join(",") !== "1,2,3,4,5,6,7,8,9") errors.push(`PPTX mapping is ${pptx.join(",")}`);
else ok("all 9 PPTX slides mapped once, original order kept");

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
const allowedDeep = ["@/prototype/components/GardenCanvas"]; // lazy prefetch only
for (const f of walk(path.join(root, "src/presentation"))) {
  const src = fs.readFileSync(f, "utf8");
  for (const m of src.matchAll(/["'](@\/(prototype|architecture|business)\/[^"']+)["']/g)) if (!allowedDeep.includes(m[1]!)) errors.push(`${path.relative(root, f)} imports ${m[1]} (use "@/${m[2]}")`);
}
ok("presentation uses only the public APIs of the prototype, architecture and business modules");

for (const f of [...walk(path.join(root, "src/prototype")), ...walk(path.join(root, "src/architecture")), ...walk(path.join(root, "src/business"))].filter((x) => !x.includes(`${path.sep}tests${path.sep}`))) {
  if (/Math\.random\(/.test(fs.readFileSync(f, "utf8"))) errors.push(`${path.relative(root, f)} uses Math.random`);
}
ok("no Math.random in the prototype, architecture or business modules");

for (const p of ["original_prototype/index.html", "original_prototype/gardentwin/GardenTwinArchitecture.jsx", "original_prototype/GardenTwin_React_Architektur.zip", "original_presentation.pptx", "source_documents/GardenTwin_Prototyp_Level_Kostenvergleich.md", "source_documents/GardenTwin_Geschaeftsmodell_Finanzkalkulation.md", "reference_images", "public/original/index.html"]) {
  if (!fs.existsSync(path.join(root, p))) errors.push(`missing original input: ${p}`);
}
ok("original inputs preserved");

if (errors.length) {
  console.error("\n✗ " + errors.join("\n✗ "));
  process.exit(1);
}
console.log("\nProject structure valid.");
