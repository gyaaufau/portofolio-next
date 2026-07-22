import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";

const root = path.resolve("public/assets/pixel-ornaments");

type RailAsset = {
  id: string;
  group?: string;
  part?: string;
  repeatAxis?: string;
  paths: { light: string; dark: string };
  intrinsic: { width: number; height: number };
};

function publicPath(assetPath: string) {
  return path.join("public", assetPath.replace(/^\//, ""));
}

async function alphaBoundsWidth(assetPath: string) {
  const { data, info } = await sharp(assetPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width;
  let right = -1;

  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    if (data[pixel * info.channels + 3] === 0) continue;
    const x = pixel % info.width;
    left = Math.min(left, x);
    right = Math.max(right, x);
  }

  assert.ok(right >= left, `${assetPath} has no opaque pixels`);
  return right - left + 1;
}

async function alphaBoundsCenter(assetPath: string) {
  const { data, info } = await sharp(assetPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width;
  let right = -1;

  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    if (data[pixel * info.channels + 3] === 0) continue;
    const x = pixel % info.width;
    left = Math.min(left, x);
    right = Math.max(right, x);
  }

  assert.ok(right >= left, `${assetPath} has no opaque pixels`);
  return { boundsCenter: (left + right + 1) / 2, canvasCenter: info.width / 2 };
}

async function greenCoverage(assetPath: string) {
  const { data, info } = await sharp(assetPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let opaque = 0;
  let greenPixels = 0;

  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    const offset = pixel * info.channels;
    const [red, green, blue, alpha] = data.subarray(offset, offset + info.channels);
    if (alpha === 0) continue;
    opaque += 1;
    if (green > red * 1.15 && green > blue * 1.05) greenPixels += 1;
  }

  return greenPixels / opaque;
}

test("the work-experience vine is a complete modular rail", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8")) as { assets: RailAsset[] };
  const parts = manifest.assets.filter((asset) => asset.group === "work-experience-vine");

  assert.deepEqual(parts.map((asset) => asset.part), ["cap", "repeat", "base"]);
  assert.equal(parts.find((asset) => asset.part === "repeat")?.repeatAxis, "y");

  for (const asset of parts) {
    const alphaMasks: Buffer[] = [];
    for (const theme of ["light", "dark"] as const) {
      const image = sharp(publicPath(asset.paths[theme])).ensureAlpha();
      const metadata = await image.metadata();
      assert.equal(metadata.width, asset.intrinsic.width);
      assert.equal(metadata.height, asset.intrinsic.height);

      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
      const alpha = Buffer.alloc(info.width * info.height);
      for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
        const offset = pixel * info.channels;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const value = data[pixel * info.channels + 3];
        assert.ok(value === 0 || value === 255, `${asset.id}/${theme} has partial alpha`);
        assert.ok(!(value && red >= 150 && blue >= 135 && Math.min(red, blue) - green >= 62), `${asset.id}/${theme} has chroma fringe`);
        alpha[pixel] = value;
      }
      assert.equal(alpha[0], 0);
      assert.equal(alpha[info.width - 1], 0);
      assert.equal(alpha[(info.height - 1) * info.width], 0);
      assert.equal(alpha[info.width * info.height - 1], 0);

      for (let y = 0; y < info.height; y += 2) {
        for (let x = 0; x < info.width; x += 2) {
          const offsets = [
            (y * info.width + x) * info.channels,
            (y * info.width + x + 1) * info.channels,
            ((y + 1) * info.width + x) * info.channels,
            ((y + 1) * info.width + x + 1) * info.channels,
          ];
          const pixels = offsets.map((offset) => data.subarray(offset, offset + info.channels));
          assert.deepEqual(pixels[0], pixels[1], `${asset.id}/${theme} breaks its 2x pixel grid`);
          assert.deepEqual(pixels[0], pixels[2], `${asset.id}/${theme} breaks its 2x pixel grid`);
          assert.deepEqual(pixels[0], pixels[3], `${asset.id}/${theme} breaks its 2x pixel grid`);
        }
      }

      if (asset.part === "repeat") {
        const rowBytes = info.width * info.channels;
        assert.deepEqual(data.subarray(0, rowBytes), data.subarray(data.length - rowBytes), `${asset.id}/${theme} has a visible repeat seam`);
      }
      alphaMasks.push(alpha);
    }
    assert.deepEqual(alphaMasks[0], alphaMasks[1], `${asset.id} theme geometry drifted`);
  }
});

test("the work-experience rail keeps its approved visual hierarchy", async () => {
  const capWidth = await alphaBoundsWidth(path.join(root, "rails/work-experience-vine/cap/light.png"));
  const repeatWidth = await alphaBoundsWidth(path.join(root, "rails/work-experience-vine/repeat/light.png"));
  const baseWidth = await alphaBoundsWidth(path.join(root, "rails/work-experience-vine/base/light.png"));

  assert.ok(repeatWidth >= 46 && repeatWidth <= 50, `repeat silhouette is ${repeatWidth}px wide, expected 46–50px`);
  assert.equal(capWidth, 52, `cap silhouette is ${capWidth}px wide, expected 52px`);
  assert.equal(baseWidth, 128, `base silhouette is ${baseWidth}px wide, expected 128px`);
});

test("the work-experience endpoints stay centered on the rail axis", async () => {
  for (const theme of ["light", "dark"] as const) {
    for (const part of ["cap", "base"] as const) {
      const centers = await alphaBoundsCenter(path.join(root, `rails/work-experience-vine/${part}/${theme}.png`));
      assert.equal(centers.boundsCenter, centers.canvasCenter, `${part}/${theme} is not horizontally centered`);
    }
  }
});

test("the approved work-experience repeat stays byte-identical", async () => {
  const expected = {
    light: "a9562326f9c369162d63bcd6eda1b59381249d02442bcb683039cfb88db06563",
    dark: "c247720b5a8a61ae5d74656d96986637990bea93ee8b0e90a9f63b3556158230",
  } as const;

  for (const theme of ["light", "dark"] as const) {
    const data = await readFile(path.join(root, `rails/work-experience-vine/repeat/${theme}.png`));
    assert.equal(createHash("sha256").update(data).digest("hex"), expected[theme], `${theme} repeat asset changed`);
  }
});

test("the work-experience rail stays visibly alive in both themes", async () => {
  for (const theme of ["light", "dark"] as const) {
    for (const part of ["cap", "repeat", "base"] as const) {
      const coverage = await greenCoverage(path.join(root, `rails/work-experience-vine/${part}/${theme}.png`));
      assert.ok(coverage >= 0.15, `${part}/${theme} has only ${(coverage * 100).toFixed(1)}% healthy-green coverage`);
    }
  }
});

test("the homepage uses every approved calibration ornament decoratively", async () => {
  const component = await readFile(path.resolve("src/components/pixel-ornament.tsx"), "utf8");
  const homepage = await readFile(path.resolve("src/app/page.tsx"), "utf8");
  const approved = [
    "reclaimed-computer-folder",
    "mossy-masonry-vine",
    "weathered-conduit",
    "abandoned-workstation-window",
  ];

  for (const name of approved) {
    assert.ok(component.includes(`\"${name}\"`), `${name} is missing from the typed ornament registry`);
    assert.ok(homepage.includes(`name=\"${name}\"`), `${name} is not integrated on the homepage`);
  }
  assert.ok(component.includes('alt=""'));
  assert.ok(component.includes('aria-hidden="true"'));
  assert.ok(component.includes("unoptimized"));
});

test("secondary-page icons have production-safe paired geometry", async () => {
  const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8")) as { assets: RailAsset[] };
  const ids = ["blog-notebook", "certificate-plaque", "cv-document"];

  for (const id of ids) {
    const asset = manifest.assets.find((candidate) => candidate.id === id);
    assert.ok(asset, `${id} is missing from the manifest`);
    assert.deepEqual(asset.intrinsic, { width: 96, height: 96 });

    const masks: Buffer[] = [];
    for (const theme of ["light", "dark"] as const) {
      const { data, info } = await sharp(publicPath(asset.paths[theme])).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const mask = Buffer.alloc(info.width * info.height);
      for (let y = 0; y < info.height; y += 2) {
        for (let x = 0; x < info.width; x += 2) {
          const pixels = [
            (y * info.width + x) * info.channels,
            (y * info.width + x + 1) * info.channels,
            ((y + 1) * info.width + x) * info.channels,
            ((y + 1) * info.width + x + 1) * info.channels,
          ].map((offset) => data.subarray(offset, offset + info.channels));
          assert.deepEqual(pixels[0], pixels[1], `${id}/${theme} breaks its 2x pixel grid`);
          assert.deepEqual(pixels[0], pixels[2], `${id}/${theme} breaks its 2x pixel grid`);
          assert.deepEqual(pixels[0], pixels[3], `${id}/${theme} breaks its 2x pixel grid`);
        }
      }
      for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
        const offset = pixel * info.channels;
        const [red, green, blue, alpha] = data.subarray(offset, offset + info.channels);
        assert.ok(alpha === 0 || alpha === 255, `${id}/${theme} has partial alpha`);
        assert.ok(!(alpha && red >= 150 && blue >= 135 && Math.min(red, blue) - green >= 62), `${id}/${theme} has chroma fringe`);
        mask[pixel] = alpha;
      }
      assert.equal(mask[0], 0);
      assert.equal(mask[info.width - 1], 0);
      assert.equal(mask[(info.height - 1) * info.width], 0);
      assert.equal(mask[info.width * info.height - 1], 0);
      masks.push(mask);
    }
    assert.deepEqual(masks[0], masks[1], `${id} theme geometry drifted`);
  }
});

test("public secondary routes use the professional ornament system", async () => {
  const files = await Promise.all([
    "src/components/public-page-header.tsx",
    "src/app/apps/page.tsx",
    "src/app/certificates/page.tsx",
    "src/app/blog/page.tsx",
    "src/app/cv/page.tsx",
    "src/components/app-detail-view.tsx",
    "src/components/certificate-detail-view.tsx",
    "src/app/blog/how-to-build-scalable-flutter-app-architecture/page.tsx",
    "src/app/not-found.tsx",
  ].map((file) => readFile(path.resolve(file), "utf8")));
  const [header, apps, certificates, blog, cv, appDetail, certificateDetail, article, notFound] = files;

  assert.ok(!header.includes('"use client"'));
  assert.ok(header.includes("PixelOrnament"));
  assert.ok(apps.includes('ornament="reclaimed-computer-folder"'));
  assert.ok(certificates.includes('ornament="certificate-plaque"'));
  assert.ok(blog.includes('ornament="blog-notebook"'));
  assert.ok(blog.includes('name="abandoned-workstation-window"'));
  assert.ok(cv.includes('ornament="cv-document"'));
  assert.ok(appDetail.includes('name="weathered-conduit"'));
  assert.ok(certificateDetail.includes('name="certificate-plaque"'));
  assert.ok(article.includes('name="blog-notebook"'));
  assert.ok(article.includes('name="weathered-conduit"'));
  assert.ok(notFound.includes('name="mossy-masonry-vine"'));
});
