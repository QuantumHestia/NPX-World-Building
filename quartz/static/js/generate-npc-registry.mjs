import fs from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.resolve("content");
const OUT_FILE = path.resolve("quartz/static/data/npcs.json");

// Minimal YAML-frontmatter parser (sufficient for your npc schema)
function parseFrontmatter(md) {
  if (!md.startsWith("---\n")) return null;
  const end = md.indexOf("\n---\n", 4);
  if (end === -1) return null;

  const lines = md.slice(4, end).split("\n");
  const fm = {};
  let currentObjKey = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "  ");
    if (!line.trim()) continue;

    // nested object line (2+ spaces)
    if (/^\s{2,}[\w-]+:\s*/.test(line) && currentObjKey) {
      const m = line.trim().match(/^([\w-]+):\s*(.*)$/);
      if (!m) continue;
      const k = m[1];
      const v = m[2];
      fm[currentObjKey] ??= {};
      fm[currentObjKey][k] = coerce(v);
      continue;
    }

    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    const val = m[2];

    if (val === "") {
      currentObjKey = key;
      fm[key] = {};
    } else {
      currentObjKey = null;
      fm[key] = coerce(val);
    }
  }

  return fm;
}

function coerce(v) {
  const s = String(v).trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  if (s === "true") return true;
  if (s === "false") return false;
  if (s === "null") return null;
  if (s !== "" && !Number.isNaN(Number(s))) return Number(s);
  return s;
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) out.push(p);
  }
  return out;
}

function slugFromPath(mdPath) {
  const rel = path.relative(CONTENT_DIR, mdPath).replace(/\\/g, "/");
  const noExt = rel.replace(/\.md$/i, "");
  // keep folder structure; normalize spaces
  const parts = noExt.split("/").map(s => s.trim().replace(/\s+/g, "-").toLowerCase());
  return "/" + parts.join("/");
}

function main() {
  const files = walk(CONTENT_DIR);
  const npcs = [];

  for (const f of files) {
    const md = fs.readFileSync(f, "utf8");
    const fm = parseFrontmatter(md);
    if (!fm) continue;

    const isNpc = (fm.type && String(fm.type).toLowerCase() === "npc") || fm.npc === true;
    if (!isNpc) continue;

    const slug = fm.slug ? String(fm.slug) : slugFromPath(f);

    const mapObj = fm.map && typeof fm.map === "object" ? fm.map : null;
    const map =
      mapObj && mapObj.lat != null && mapObj.lng != null
        ? { lat: Number(mapObj.lat), lng: Number(mapObj.lng), z: mapObj.z ?? -2.0 }
        : null;

    npcs.push({
      name: fm.name || fm.title || path.basename(f, ".md"),
      slug,
      portrait: fm.portrait || "/static/npcs/placeholder.jpg",
      faction: fm.faction || "",
      status: fm.status || "",
      timeline: fm.timeline || "/timeline",
      map: map && !Number.isNaN(map.lat) && !Number.isNaN(map.lng) ? map : null,
    });
  }

  npcs.sort((a, b) => String(a.name).localeCompare(String(b.name)));

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(npcs, null, 2) + "\n", "utf8");
  console.log(`Wrote ${npcs.length} NPCs -> ${OUT_FILE}`);
}

main();
