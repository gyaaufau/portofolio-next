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

The work-experience rail is assembled from `cap`, `repeat`, and `base`. The homepage displays the cap and repeat at their native 96-pixel width and the heroic base at its native 160×112 size. Center every module on the same rail axis, pin the cap and base to the timeline bounds, and vertically repeat the middle part; taller content then produces more pole-and-vine growth without JavaScript measurement.

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
Color palette: weathered charcoal and gray metal, restrained warm rust traces, fresh natural greens, and tiny pale highlights. Vegetation must read as healthy and living in both themes without becoming neon or lush. Match the approved pack.
Backdrop: perfectly flat solid #FF00FF chroma-key background, uniform edge to edge. No gradient, floor, texture, lighting variation, shadow, glow, reflection, or transparency. Do not use #FF00FF in the subject.
Constraints: isolated module, generous padding, no flag, fabric, banner, character, face, animal, letters, numbers, logos, UI glyphs, watermark, cast shadow, antialiasing, soft blur, or accidental text.
```

### Top cap

```text
Module: TOP CAP.
Composition: tall narrow portrait module, pole precisely centered on the horizontal axis and exiting through the exact bottom center so it can connect to another module. Match the approved repeat's vine winding, leaf scale, density, weathering, and 46–48-pixel silhouette so the cap reads as its natural upper continuation. Show the empty capped top of the pole and a restrained finishing vine curl without rope or flag. Keep the bottom connection simple and perfectly vertical.
```

### Seamless middle repeat

```text
Module: SEAMLESS MIDDLE REPEAT.
Composition: very tall narrow portrait module. The metal pole must be precisely centered, perfectly vertical, constant width, and continue through both the exact top center and exact bottom center. A sturdy vine spirals around it and also crosses both top and bottom at the same horizontal connection point. The complete opaque silhouette must span 46–50 pixels on the final 96-pixel-wide canvas so it visually matches the cap. Add three or four varied sparse leaf clusters at irregular heights and alternating sides. Make top and bottom visually compatible for vertical repetition; no base and no cap.
```

### Rooted base

```text
Module: ROOTED BASE.
Composition: wide 160×112 module, with the pole entering through the exact top center and ending in a heroic ancient stone plinth. Build a broad stepped boulder silhouette with a strong central peak, layered weathered masonry, visible roots, two restrained healthy grass tufts, fresh moss patches, and a few loose stones. Target a centered 160-pixel final footprint, keep the top connector identical to the repeat's bottom connector, rest the plinth on the final canvas row, and use no cast shadow.
```

## Production notes

### Section-leading icons and footer environment

The homepage uses five neutral, single-variant leading icons from `section-icons/`:

- `section_icon_about.png`
- `section_icon_app_catalog.png`
- `section_icon_work_experience.png`
- `section_icon_certificates.png`
- `section_icon_contact.png`

Each section icon is 64×64 and represents a 32×32 logical grid at exact 2× scale. The section-icon files remain unchanged.

The full-width footer uses exactly four neutral assets from `footer/`:

- `footer_ground_tile.png` — 128×32 seamless horizontal repeat
- `footer_left_environment.png` — 240×128 desktop supporting cluster
- `footer_utility_cluster.png` — 420×220 desktop focal cluster
- `footer_mobile_utility_cluster.png` — 260×160 simplified mobile cluster

The desktop cluster contains a generic electrical box, slim pole, and a bird perched directly on the box. Electrical cables are intentionally omitted in both utility assets. Its approved display sizes are 420×220 on desktop and 336×176 on tablet. Mobile uses the dedicated cluster at approximately 220×135 so the environment stays compact on narrow screens. The ground tile is never stretched and repeats at its native 128×32 size.

All four assets were generated separately with the built-in image generator. The approved workstation ornament and desktop utility result were used only as visual-family references. The final refinement prompts removed all wires, placed each bird on its utility box, and strengthened the vegetation with fresh muted greens while preserving sparse density. Prompts required a flat `#FF00FF` chroma background, neutral weathered materials, crisp square pixel clusters, upper-left lighting, no readable text or logos, and no configurable UI accent color. The ground prompt additionally required matching side-edge height and structure for seamless repetition.

The chroma background was removed locally, edge pixels were despilled, and alpha was reduced to fully transparent or fully opaque values. Footer sources were normalized to their exact final canvases with nearest-neighbor sampling and an 18-color maximum palette. Every visible base is aligned to the last canvas row so CSS `bottom: 0` positioning shares one baseline with the ground tile. The ground tile received matching boundary columns so repeated copies join cleanly. Dark contours were checked directly on the project’s real light and dark surfaces.
