import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";
import { formatCopyrightYear } from "../src/lib/copyright";

const root = path.resolve("public/assets/pixel-ornaments");
const sectionIconNames = [
  "section_icon_about.png",
  "section_icon_app_catalog.png",
  "section_icon_certificates.png",
  "section_icon_contact.png",
  "section_icon_work_experience.png",
] as const;
const footerAssetDimensions = {
  "footer_ground_tile.png": [128, 32],
  "footer_left_environment.png": [240, 128],
  "footer_mobile_utility_cluster.png": [260, 160],
  "footer_utility_cluster.png": [420, 220],
} as const;

async function validatePixelAsset(assetPath: string, expectedSize: number) {
  const { data, info } = await sharp(assetPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width, expectedSize);
  assert.equal(info.height, expectedSize);

  let opaque = 0;
  let green = 0;
  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    const offset = pixel * info.channels;
    const [red, greenChannel, blue, alpha] = data.subarray(offset, offset + info.channels);
    assert.ok(alpha === 0 || alpha === 255, `${assetPath} has partial alpha`);
    assert.ok(!(alpha && red >= 150 && blue >= 135 && Math.min(red, blue) - greenChannel >= 62), `${assetPath} has chroma fringe`);
    if (!alpha) continue;
    opaque += 1;
    if (greenChannel > red * 1.15 && greenChannel > blue * 1.05) green += 1;
  }

  assert.ok(opaque > expectedSize * expectedSize * 0.08, `${assetPath} has too little visible artwork`);
  assert.ok(green / opaque < 0.05, `${assetPath} depends too heavily on green`);

  const corners = [0, info.width - 1, (info.height - 1) * info.width, info.width * info.height - 1];
  for (const pixel of corners) assert.equal(data[pixel * info.channels + 3], 0, `${assetPath} lacks transparent padding`);

  for (let y = 0; y < info.height; y += 2) {
    for (let x = 0; x < info.width; x += 2) {
      const offsets = [
        (y * info.width + x) * info.channels,
        (y * info.width + x + 1) * info.channels,
        ((y + 1) * info.width + x) * info.channels,
        ((y + 1) * info.width + x + 1) * info.channels,
      ];
      const pixels = offsets.map((offset) => data.subarray(offset, offset + info.channels));
      assert.deepEqual(pixels[0], pixels[1], `${assetPath} breaks its 2× grid`);
      assert.deepEqual(pixels[0], pixels[2], `${assetPath} breaks its 2× grid`);
      assert.deepEqual(pixels[0], pixels[3], `${assetPath} breaks its 2× grid`);
    }
  }
}

test("the section-leading family contains exactly five production-safe icons", async () => {
  const files = (await readdir(path.join(root, "section-icons"))).sort();
  assert.deepEqual(files, [...sectionIconNames]);
  for (const filename of sectionIconNames) await validatePixelAsset(path.join(root, "section-icons", filename), 64);
});

test("the footer contains exactly four production-safe environment assets", async () => {
  const files = (await readdir(path.join(root, "footer"))).sort();
  assert.deepEqual(files, Object.keys(footerAssetDimensions).sort());

  for (const filename of files) {
    const [expectedWidth, expectedHeight] = footerAssetDimensions[filename as keyof typeof footerAssetDimensions];
    const { data, info } = await sharp(path.join(root, "footer", filename)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(info.width, expectedWidth);
    assert.equal(info.height, expectedHeight);

    const colors = new Set<string>();
    let opaque = 0;
    let naturalGreen = 0;
    let neonGreen = 0;
    let maxOpaqueY = -1;
    for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
      const offset = pixel * info.channels;
      const [red, greenChannel, blue, alpha] = data.subarray(offset, offset + info.channels);
      assert.ok(alpha === 0 || alpha === 255, `${filename} has partial alpha`);
      assert.ok(!(alpha && red >= 150 && blue >= 135 && Math.min(red, blue) - greenChannel >= 62), `${filename} has chroma fringe`);
      if (!alpha) continue;
      opaque += 1;
      maxOpaqueY = Math.floor(pixel / info.width);
      colors.add(`${red},${greenChannel},${blue}`);
      if (greenChannel > red * 1.08 && greenChannel > blue * 1.08) naturalGreen += 1;
      if (greenChannel > 225 && red < 100 && blue < 100) neonGreen += 1;
    }

    assert.ok(opaque > info.width * info.height * 0.03, `${filename} has too little visible artwork`);
    assert.ok(colors.size <= 18, `${filename} exceeds the restrained footer palette`);
    assert.ok(naturalGreen / opaque > 0.02, `${filename} does not read as living vegetation`);
    assert.ok(naturalGreen / opaque < 0.4, `${filename} is too heavily dominated by vegetation`);
    assert.ok(neonGreen / opaque < 0.01, `${filename} uses neon green`);
    assert.equal(maxOpaqueY, info.height - 1, `${filename} floats above the shared footer baseline`);
    assert.equal(data[3], 0, `${filename} lacks upper-left transparency`);
    assert.equal(data[(info.width - 1) * info.channels + 3], 0, `${filename} lacks upper-right transparency`);

    if (filename.includes("utility_cluster")) {
      let maxUpperRun = 0;
      for (let y = 0; y < info.height * 0.65; y += 1) {
        let run = 0;
        for (let x = 0; x < info.width; x += 1) {
          const alpha = data[(y * info.width + x) * info.channels + 3];
          run = alpha ? run + 1 : 0;
          maxUpperRun = Math.max(maxUpperRun, run);
        }
      }
      assert.ok(maxUpperRun < info.width * 0.24, `${filename} contains a cable-like horizontal run`);
    }
  }
});

test("the footer ground tile joins cleanly across its horizontal seam", async () => {
  const { data, info } = await sharp(path.join(root, "footer/footer_ground_tile.png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let y = 0; y < info.height; y += 1) {
    const left = (y * info.width) * info.channels;
    const right = (y * info.width + info.width - 1) * info.channels;
    assert.deepEqual(data.subarray(left, left + info.channels), data.subarray(right, right + info.channels));
  }
});

test("every non-hero homepage section uses its mapped leading icon", async () => {
  const [homepage, registry] = await Promise.all([
    readFile(path.resolve("src/app/page.tsx"), "utf8"),
    readFile(path.resolve("src/components/section-leading-icon.tsx"), "utf8"),
  ]);
  const names = ["about", "app-catalog", "work-experience", "certificates", "contact"];

  assert.equal((homepage.match(/<SectionLeadingIcon /g) ?? []).length, 5);
  for (const name of names) {
    assert.match(homepage, new RegExp(`SectionLeadingIcon name="${name}"`));
    assert.match(registry, new RegExp(`(?:"${name}"|${name}):`));
  }
  assert.doesNotMatch(homepage.match(/<Hero[^>]*>/)?.[0] ?? "", /SectionLeadingIcon/);
  assert.match(registry, /alt=""/);
  assert.match(registry, /aria-hidden="true"/);
  assert.match(registry, /image-rendering:pixelated/);
});

test("copyright years use a single year in 2026 and an en-dash range later", () => {
  assert.equal(formatCopyrightYear(2026), "2026");
  assert.equal(formatCopyrightYear(2027), "2026–2027");
  assert.equal(formatCopyrightYear(2032), "2026–2032");
  assert.notEqual(formatCopyrightYear(2026), "2026–2026");
});

test("the public footer is responsive, decorative, and server-slotted", async () => {
  const [footer, footerStyles, chrome, layout] = await Promise.all([
    readFile(path.resolve("src/components/footer.tsx"), "utf8"),
    readFile(path.resolve("src/components/footer.module.css"), "utf8"),
    readFile(path.resolve("src/components/public-chrome.tsx"), "utf8"),
    readFile(path.resolve("src/app/layout.tsx"), "utf8"),
  ]);

  assert.match(footer, /<footer/);
  for (const filename of Object.keys(footerAssetDimensions).filter((name) => name !== "footer_ground_tile.png")) {
    assert.match(footer, new RegExp(filename.replace(".", "\\.")));
  }
  assert.doesNotMatch(footer, /copyright_pixel_icon\.png/);
  assert.match(footer, /alt=""/);
  assert.match(footer, /aria-hidden="true"/);
  assert.match(footer, /new Date\(\)\.getFullYear\(\)/);
  assert.doesNotMatch(footer, /<Link|href=/);
  assert.match(footerStyles, /footer_ground_tile\.png/);
  assert.match(footerStyles, /background-repeat: repeat-x/);
  assert.match(footerStyles, /width: 420px/);
  assert.match(footerStyles, /width: 336px/);
  assert.match(footerStyles, /width: min\(220px, calc\(100vw - 24px\)\)/);
  assert.match(footerStyles, /height: 145px/);
  assert.match(footerStyles, /image-rendering: pixelated/);
  assert.match(footerStyles, /pointer-events: none/);
  assert.match(chrome, /footer: React\.ReactNode/);
  assert.match(layout, /footer=\{<Footer \/>\}/);
});

test("the ornament manifest documents the section icons and four footer assets", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8")) as {
    assets: { id: string; category: string; path?: string }[];
  };
  const sectionAssets = manifest.assets.filter((asset) => asset.category === "section-icon");
  const footerAssets = manifest.assets.filter((asset) => asset.category === "footer-environment");

  assert.equal(sectionAssets.length, 5);
  assert.deepEqual(footerAssets.map((asset) => asset.id), [
    "footer-ground-tile",
    "footer-left-environment",
    "footer-utility-cluster",
    "footer-mobile-utility-cluster",
  ]);
  for (const asset of [...sectionAssets, ...footerAssets]) assert.ok(asset.path?.endsWith(".png"));
});
