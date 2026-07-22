# Pixel Ornament Calibration Pack

This pack contains seven environmental concepts and a modular work-experience vine rail in paired light and dark palettes. The supplied portfolio screenshot was used only as a style reference. `public/data/brand/cozy-workspace-pixel.png` and the hero-game assets were not used or changed.

## Usage

Select the `light.png` asset for the light theme and `dark.png` for the dark theme. Every pair has identical dimensions and alpha geometry. All assets are decorative; use an empty alt value and hide them from assistive technology.

```tsx
<picture aria-hidden="true">
  <source media="(prefers-color-scheme: dark)" srcSet="/assets/pixel-ornaments/icons/reclaimed-computer-folder/dark.png" />
  <img src="/assets/pixel-ornaments/icons/reclaimed-computer-folder/light.png" alt="" className="pixel-ornament" />
</picture>
```

```css
.pixel-ornament {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
```

Use one of the discrete sizes recorded in `manifest.json`. The files use a 2× nearest-neighbor grid, so the documented half-size and native-size options preserve whole pixel blocks. Do not apply blur, smoothing, drop shadows, arbitrary recoloring, non-uniform scaling, or fractional transforms.

The work-experience rail is assembled from `cap`, `repeat`, and `base`. Display them at 48×64, 48×128, and 64×48 respectively. Pin the cap and base to the timeline bounds and vertically repeat the middle part; taller content then produces more pole-and-vine growth without JavaScript measurement.

The review sheets composite the pack on the project surfaces:

- Light: page `#F5F4EF`, card `#FBFAF6`
- Dark: page `#171B1E`, card `#1F2528`
- Secondary-page review: `previews/secondary-pages-light.png` and `previews/secondary-pages-dark.png`

## Final generation prompts

Each concept was generated separately with the built-in image generator. The supplied screenshot was passed as Image 1 in a style-reference role, not as an edit target. The light and dark PNGs were then derived from the same cleaned source geometry through deterministic palette mapping; separate dark generations were intentionally avoided so the pair geometry could not drift.

### Common prompt

```text
Use case: stylized-concept.
Asset type: isolated environmental pixel ornament for a modern editorial portfolio.
Input image: Image 1 is a style reference only. Borrow its sparse, cozy post-apocalyptic/solarpunk environmental language, restrained vegetation, weathered materials, compact sprite scale, and hard pixel edges. Do not reproduce its page layout, typography, people, hero, game, or existing illustrations.
Style/medium: genuine hard-edged pixel art with deliberate square pixel clusters, a restrained retro palette, crisp silhouette, sparse asymmetrical detail, and generous empty padding.
Color palette: charcoal, weathered gray, warm timber, muted moss green, restrained amber accent, and pale glass where applicable.
Backdrop: one perfectly flat solid #FF00FF chroma-key background with no gradient, texture, floor, shadow, glow, reflection, or lighting variation. Never use #FF00FF in the subject.
Constraints: no antialiasing, soft painterly blur, translucent pixels, watermark, characters, faces, animals, letters, numbers, symbols, labels, screen UI, or accidental text.
```

### Reclaimed computer/folder icon

```text
Composition: square canvas.
Subject: a compact reclaimed retro computer whose casing subtly includes the tabbed shape of a salvaged file folder, with a tiny sprout emerging from one cracked top seam. Blank dark screen, one loose cable, minimal wear, strong readable silhouette. Keep the object centered and isolated.
```

### Mossy masonry corner

```text
Composition: square canvas.
Subject: a sparse bottom-left L-shaped fragment of cracked masonry with two small grass tufts, patches of moss, and one thin vine trailing upward then inward. Uneven silhouette, substantial negative space, no complete wall or frame.
```

### Weathered conduit divider

```text
Composition: ultra-wide horizontal ornament arranged within the canvas.
Subject: a thin weathered cable or metal conduit crossing most of the width, interrupted off-center by a damaged connector, a small moss cluster, and two short vegetation shoots. Keep the line light, broken, asymmetrical, and vertically compact.
```

### Abandoned workstation/window scene

```text
Composition: 4:3 isolated editorial vignette.
Subject: a small abandoned workstation beneath or beside a cracked window: simple desk, blank inactive monitor, compact lamp, one hanging cable, and two restrained plants reclaiming the edges. No person, no chair silhouette resembling a person, no readable screen content, and no room-filling background.
```

## Secondary-page icon prompts

The original screenshot and approved light review sheet were supplied as style references. Each icon was generated separately on a solid chroma key, then its light and dark variants were derived from one cleaned alpha mask so their geometry remains identical.

### Blog notebook

```text
Create one compact environmental pixel-art icon for a professional developer portfolio: a reclaimed field notebook combined with a tiny writing terminal, its cover weathered and subtly overgrown by one small sprout. No people, characters, embedded text, letters, numbers, or logo. Use a sparse asymmetrical silhouette, generous empty padding, hard crisp pixel clusters, deliberate blocky edges, and no antialiasing, soft blur, painterly texture, or cast shadow. Match the reference's restrained olive green, charcoal, warm concrete, and muted brass palette. Front three-quarter view, readable at 48px, on a perfectly flat solid #FF00FF chroma-key background. Square composition.
```

### Certificate plaque

```text
Create one compact environmental pixel-art icon for a professional developer portfolio: a weathered metal achievement plaque or seal mounted on a small reclaimed backing plate, with restrained moss and one tiny leaf. Suggest certification and earned craft without any recognizable institutional emblem. No people, characters, embedded text, letters, numbers, or logo. Use a sparse asymmetrical silhouette, generous empty padding, hard crisp pixel clusters, deliberate blocky edges, and no antialiasing, soft blur, painterly texture, or cast shadow. Match the reference's restrained olive green, charcoal, warm concrete, and muted brass palette. Front three-quarter view, readable at 48px, on a perfectly flat solid #FF00FF chroma-key background. Square composition.
```

### CV document

```text
Create one compact environmental pixel-art icon for a professional developer portfolio: a reclaimed clipped document folder or slim clipboard, weathered but orderly, with a small trailing vine curling from one corner. The paper is blank and contains absolutely no marks. No people, characters, embedded text, letters, numbers, or logo. Use a sparse asymmetrical silhouette, generous empty padding, hard crisp pixel clusters, deliberate blocky edges, and no antialiasing, soft blur, painterly texture, or cast shadow. Match the reference's restrained olive green, charcoal, warm concrete, and muted brass palette. Front three-quarter view, readable at 48px, on a perfectly flat solid #FF00FF chroma-key background. Square composition.
```

## Work-experience vine prompts

The original screenshot and the approved light preview sheet were supplied as style references for each module.

### Common rail prompt

```text
Use case: stylized-concept.
Asset type: modular vertical pixel-art ornament for a modern editorial work-experience timeline.
Input images: Image 1 is the original visual-direction reference. Image 2 is the approved pixel-ornament calibration sheet and should control palette density, hard pixel scale, weathering, moss, and silhouette treatment. Use both only as style references; do not copy their layouts or objects.
Primary direction: a reclaimed weathered metal flagpole-like timeline spine with no flag anywhere, being overtaken by a slender living vine. Cozy post-apocalyptic/solarpunk, sparse rather than lush, asymmetrical leaf clusters, compact environmental sprite scale.
Style/medium: genuine hard-edged pixel art, deliberate square pixel clusters, crisp silhouette, restricted retro palette, no painterly blending.
Color palette: weathered charcoal and gray metal, warm rust traces, muted moss greens, tiny pale highlights. Match the approved pack.
Backdrop: perfectly flat solid #FF00FF chroma-key background, uniform edge to edge. No gradient, floor, texture, lighting variation, shadow, glow, reflection, or transparency. Do not use #FF00FF in the subject.
Constraints: isolated module, generous padding, no flag, fabric, banner, character, face, animal, letters, numbers, logos, UI glyphs, watermark, cast shadow, antialiasing, soft blur, or accidental text.
```

### Top cap

```text
Module: TOP CAP.
Composition: tall narrow portrait module, pole precisely centered on the horizontal axis and exiting through the exact bottom center so it can connect to another module. Show the empty capped top of the pole, one tiny pulley or tie-loop detail without rope or flag, and a young vine tip curling around the upper pole with only a few leaves. Keep the bottom connection simple and perfectly vertical.
```

### Seamless middle repeat

```text
Module: SEAMLESS MIDDLE REPEAT.
Composition: very tall narrow portrait module. The metal pole must be precisely centered, perfectly vertical, constant width, and continue through both the exact top center and exact bottom center. A thin vine spirals around it and also crosses both top and bottom at the same horizontal connection point. Add three or four varied sparse leaf clusters at irregular heights and alternating sides. Make top and bottom visually compatible for vertical repetition; no base and no cap.
```

### Rooted base

```text
Module: ROOTED BASE.
Composition: tall narrow portrait module, with the pole entering through the exact top center and ending in a compact reclaimed masonry-and-soil base near the bottom. Add visible roots, two restrained grass tufts, small moss patches, and a few loose stones. Keep the footprint wider than the pole but compact, with transparent-looking chroma space around it and no cast shadow.
```

## Production notes

The chroma background was removed locally, edge pixels were despilled, and alpha was reduced to fully transparent or fully opaque values. Each cleaned subject was trimmed, fitted into a consistently padded logical canvas, mapped to a restrained palette, and upscaled exactly 2× with nearest-neighbor sampling. Dark contours were calibrated directly on the project’s real page and card colors.
