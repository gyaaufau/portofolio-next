import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ScreenshotCarousel } from "../src/components/screenshot-carousel";
import { ScreenshotUpload } from "../src/components/screenshot-upload";
import { screenshotDimensions } from "../src/lib/screenshots";
import type { AppScreenshot } from "../src/data/types";

function shot(width: number, height: number): AppScreenshot {
  return { id: "one", src: "/screenshot.png", alt: "App screenshot", width, height, order: 0 };
}

test("uploaded screenshots without dimensions reserve a visible frame", () => {
  for (const [width, height] of [[0, 0], [320, 0], [-1, 480], [NaN, 480]]) {
    const html = renderToStaticMarkup(createElement(ScreenshotCarousel, { appTitle: "Garden", screenshots: [shot(width, height)] }));
    assert.match(html, /aspect-ratio:9\s*\/\s*16/);
    assert.doesNotMatch(html, /aspect-ratio:(?:0|NaN|-1)/);
  }
});

test("screenshots with dimensions keep their intrinsic portrait or landscape ratio", () => {
  for (const [width, height] of [[223, 483], [1200, 800]]) {
    const html = renderToStaticMarkup(createElement(ScreenshotCarousel, { appTitle: "Garden", screenshots: [shot(width, height)] }));
    assert.ok(html.includes(`aspect-ratio:${width}/${height}`));
  }
});

test("editing screenshots submits their saved dimensions", () => {
  const html = renderToStaticMarkup(createElement(ScreenshotUpload, {
    bucket: "apps", path: "garden", initialScreenshots: [shot(223, 483), shot(1200, 800)],
  }));
  assert.match(html, /name="screenshotWidth_0" value="223"/);
  assert.match(html, /name="screenshotHeight_0" value="483"/);
  assert.match(html, /name="screenshotWidth_1" value="1200"/);
  assert.match(html, /name="screenshotHeight_1" value="800"/);
});

test("saved dimensions accept form strings and tolerate old missing metadata", () => {
  assert.deepEqual(screenshotDimensions("223", "483"), { width: 223, height: 483 });
  for (const [width, height] of [[undefined, undefined], [0, 0], [320, NaN], [Infinity, 800], [-1, 480]]) {
    assert.deepEqual(screenshotDimensions(width, height), { width: 0, height: 0 });
  }
});
