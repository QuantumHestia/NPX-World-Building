#!/usr/bin/env node
/**
 * Generates Leaflet-compatible tiles from large map PNGs.
 *
 * Tile zoom levels 0-5 map to Leaflet zoom levels -5 to 0.
 * (Use zoomOffset: 5 in Leaflet tileLayer.)
 *
 * Usage: node scripts/generate-tiles.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const TILE_SIZE = 256;
const MAX_TILE_ZOOM = 5; // tile z=5 = Leaflet zoom 0 = native resolution

// Source PNGs live in source-maps/ (outside quartz/static/ so they're not
// copied to public/ on every build — only the generated tiles need to be served).
const MAPS = [
  {
    name: 'eldoria',
    src: 'source-maps/eldoria-map.png',
    width: 6336,
    height: 2688,
  },
  {
    name: 'summer-isles',
    src: 'source-maps/the-summer-isles.png',
    width: 5760,
    height: 2944,
  },
];

async function generateTiles(map) {
  const srcPath = path.join(ROOT, map.src);
  const outBase = path.join(ROOT, 'quartz/static/tiles', map.name);

  console.log(`\n=== ${map.name} ===`);
  console.log(`Source: ${srcPath}`);

  // Decode image once at native resolution into a raw buffer.
  // We then resize from this buffer for each zoom level.
  console.log('Decoding source image...');
  const nativeBuffer = await sharp(srcPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: nativeW, height: nativeH, channels } = nativeBuffer.info;
  console.log(`Decoded: ${nativeW}×${nativeH} (${channels}ch)`);

  for (let z = 0; z <= MAX_TILE_ZOOM; z++) {
    // At tile zoom z, image is scaled by 2^(z - MAX_TILE_ZOOM) relative to native.
    const scale = Math.pow(2, z - MAX_TILE_ZOOM);
    const scaledW = Math.max(1, Math.round(nativeW * scale));
    const scaledH = Math.max(1, Math.round(nativeH * scale));
    const tilesX = Math.ceil(scaledW / TILE_SIZE);
    const tilesY = Math.ceil(scaledH / TILE_SIZE);

    console.log(
      `z=${z} (Leaflet zoom ${z - MAX_TILE_ZOOM}): ${scaledW}×${scaledH} → ${tilesX}×${tilesY} tiles`
    );

    // Resize the image for this zoom level
    const resizedBuf = await sharp(nativeBuffer.data, {
      raw: { width: nativeW, height: nativeH, channels },
    })
      .resize(scaledW, scaledH, { fit: 'fill', kernel: 'lanczos3' })
      .raw()
      .toBuffer();

    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        const left = x * TILE_SIZE;
        const top = y * TILE_SIZE;
        const tileW = Math.min(TILE_SIZE, scaledW - left);
        const tileH = Math.min(TILE_SIZE, scaledH - top);

        const outDir = path.join(outBase, String(z), String(x));
        fs.mkdirSync(outDir, { recursive: true });
        const outPath = path.join(outDir, `${y}.png`);

        await sharp(resizedBuf, {
          raw: { width: scaledW, height: scaledH, channels },
        })
          .extract({ left, top, width: tileW, height: tileH })
          .resize(TILE_SIZE, TILE_SIZE, {
            fit: 'contain',
            position: 'left top',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
            kernel: 'nearest',
          })
          .png({ compressionLevel: 6, effort: 1 })
          .toFile(outPath);
      }
    }

    process.stdout.write(`  z=${z} done\n`);
  }

  console.log(`${map.name}: done`);
}

async function main() {
  for (const map of MAPS) {
    await generateTiles(map);
  }
  console.log('\nAll tiles generated.');
  console.log('Output: quartz/static/tiles/{eldoria,summer-isles}/{z}/{x}/{y}.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
