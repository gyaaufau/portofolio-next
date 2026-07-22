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

test("the footer contains one production-safe copyright icon", async () => {
  assert.deepEqual(await readdir(path.join(root, "footer")), ["copyright_pixel_icon.png"]);
  await validatePixelAsset(path.join(root, "footer/copyright_pixel_icon.png"), 32);
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

test("the public footer is minimal, decorative, and server-slotted", async () => {
  const [footer, chrome, layout] = await Promise.all([
    readFile(path.resolve("src/components/footer.tsx"), "utf8"),
    readFile(path.resolve("src/components/public-chrome.tsx"), "utf8"),
    readFile(path.resolve("src/app/layout.tsx"), "utf8"),
  ]);

  assert.match(footer, /<footer/);
  assert.match(footer, /copyright_pixel_icon\.png/);
  assert.match(footer, /alt=""/);
  assert.match(footer, /aria-hidden="true"/);
  assert.match(footer, /new Date\(\)\.getFullYear\(\)/);
  assert.doesNotMatch(footer, /<Link|href=/);
  assert.match(chrome, /footer: React\.ReactNode/);
  assert.match(layout, /footer=\{<Footer \/>\}/);
});

test("the ornament manifest documents all six new assets", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8")) as {
    assets: { id: string; category: string; path?: string }[];
  };
  const sectionAssets = manifest.assets.filter((asset) => asset.category === "section-icon");
  const footerAssets = manifest.assets.filter((asset) => asset.category === "footer-icon");

  assert.equal(sectionAssets.length, 5);
  assert.deepEqual(footerAssets.map((asset) => asset.id), ["copyright-pixel-icon"]);
  for (const asset of [...sectionAssets, ...footerAssets]) assert.ok(asset.path?.endsWith(".png"));
});
