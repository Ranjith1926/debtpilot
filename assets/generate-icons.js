/* Generate all required app icons from the SVG sources.
   Run once: node assets/generate-icons.js */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS = path.join(__dirname);

async function svgToPng(svgPath, outPath, size, background) {
  const svg = fs.readFileSync(svgPath);
  let pipeline = sharp(svg, { density: 400 }).resize(size, size);
  if (background) pipeline = pipeline.flatten({ background });
  await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
  console.log(`  ✓ ${path.basename(outPath)} (${size}×${size})`);
}

async function main() {
  console.log('Generating DebtPilot app icons…\n');

  // Main app icon (iOS uses this; opaque background already in SVG)
  await svgToPng(
    path.join(ASSETS, 'icon.svg'),
    path.join(ASSETS, 'icon.png'),
    1024,
  );

  // Android adaptive icon — foreground only, transparent background
  await svgToPng(
    path.join(ASSETS, 'adaptive-icon.svg'),
    path.join(ASSETS, 'adaptive-icon.png'),
    1024,
  );

  // Splash screen icon — same as main icon, smaller
  await svgToPng(
    path.join(ASSETS, 'icon.svg'),
    path.join(ASSETS, 'splash-icon.png'),
    1024,
  );

  // Web favicon — opaque on dark background
  await svgToPng(
    path.join(ASSETS, 'icon.svg'),
    path.join(ASSETS, 'favicon.png'),
    96,
  );

  console.log('\nAll icons generated in assets/');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
