import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
const PORTRAIT_DIR = path.join(ROOT, "content", "Images", "Portraits");
const CONTENT_DIR = path.join(ROOT, "content");
const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);
const DRY_RUN = process.argv.includes("--dry-run");
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1600;
const WEBP_QUALITY = 82;

async function walk(directory, predicate = () => true) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(file, predicate)));
    else if (entry.isFile() && predicate(file)) files.push(file);
  }
  return files;
}

async function needsUpdate(source, output) {
  try {
    const [sourceStat, outputStat] = await Promise.all([
      fs.stat(source),
      fs.stat(output),
    ]);
    return sourceStat.mtimeMs > outputStat.mtimeMs;
  } catch (error) {
    if (error?.code === "ENOENT") return true;
    throw error;
  }
}

async function optimize(source) {
  const extension = path.extname(source);
  const output = source.slice(0, -extension.length) + ".webp";
  if (!(await needsUpdate(source, output)))
    return { source, output, status: "current" };
  if (DRY_RUN) return { source, output, status: "pending" };

  await sharp(source)
    .rotate()
    .resize({
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toFile(output);
  return { source, output, status: "optimized" };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function referenceReplacements(results) {
  const replacements = new Map();
  for (const { source, output } of results) {
    const sourceRelative = path
      .relative(CONTENT_DIR, source)
      .replaceAll(path.sep, "/");
    const outputRelative = path
      .relative(CONTENT_DIR, output)
      .replaceAll(path.sep, "/");
    replacements.set(path.basename(source), path.basename(output));
    replacements.set(sourceRelative, outputRelative);
    replacements.set(`/${sourceRelative}`, `/${outputRelative}`);
  }
  return [...replacements]
    .sort(([a], [b]) => b.length - a.length)
    .map(([from, to]) => [new RegExp(escapeRegExp(from), "g"), to]);
}

async function rewriteMarkdown(results) {
  const replacements = referenceReplacements(results);
  const markdown = await walk(
    CONTENT_DIR,
    (file) => path.extname(file).toLowerCase() === ".md",
  );
  let changed = 0;
  for (const file of markdown) {
    const original = await fs.readFile(file, "utf8");
    let updated = original;
    for (const [pattern, replacement] of replacements)
      updated = updated.replace(pattern, replacement);
    if (updated === original) continue;
    changed += 1;
    if (!DRY_RUN) await fs.writeFile(file, updated, "utf8");
  }
  return changed;
}

async function main() {
  try {
    await fs.access(PORTRAIT_DIR);
  } catch {
    console.log(
      `Portrait directory not found; skipping: ${path.relative(ROOT, PORTRAIT_DIR)}`,
    );
    return;
  }

  const sources = await walk(PORTRAIT_DIR, (file) =>
    SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()),
  );
  const results = [];
  for (const source of sources) results.push(await optimize(source));
  const markdownChanged = await rewriteMarkdown(results);
  const count = (status) =>
    results.filter((result) => result.status === status).length;
  console.log(
    `${DRY_RUN ? "Dry run: " : ""}${sources.length} sources; ${count("optimized")} optimized; ` +
      `${count("pending")} pending; ${count("current")} current; ${markdownChanged} Markdown files ` +
      `${DRY_RUN ? "would change" : "updated"}.`,
  );
}

main().catch((error) => {
  console.error("Portrait optimization failed:", error);
  process.exitCode = 1;
});
