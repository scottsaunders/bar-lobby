# Unit Images — Source & Maintenance Notes

## What this file is

`unit-images.json` maps unit codenames (e.g. `"armflea"`) to two image URLs scraped
from beyondallreason.info:

```json
{
  "armflea": {
    "icon": "https://cdn.prod.website-files.com/.../avif",
    "image": "https://cdn.prod.website-files.com/.../webp"
  }
}
```

| Field   | Format | Used as                        |
|---------|--------|--------------------------------|
| `icon`  | AVIF   | Large background render on the unit card |
| `image` | WebP   | Small strategic icon in the top-right corner of the card |

Note: the field names are counterintuitive — `icon` is the large image and `image`
is the small one. This is an artifact of how the scraper labelled them. Do not swap
them without updating `UnitOverviewCard.vue` to match.

---

## Where the images come from

Images are hosted on the **Webflow CDN** used by beyondallreason.info:

```
https://cdn.prod.website-files.com/5c69241780da2a1dfc6caa4e/{hash}_{filename}
```

- AVIF files have timestamp-style names (e.g. `655cc758..._20231121T0258-....avif`)
  and are the unit render images shown centrally on the website cards.
- WebP files have the unit codename in the filename (e.g. `6994c09c..._armflea.webp`)
  and are the strategic icon images shown in the card corners.

The URLs are **not predictable** — each has a Webflow-assigned hash prefix. They were
collected by scraping all 16 Armada and Cortex unit category pages on the website.

---

## Coverage

| Faction    | Units with images |
|------------|-------------------|
| Armada     | ~131              |
| Cortex     | ~155              |
| Legion     | 0                 |
| Scavengers | 0                 |
| Other      | 0                 |

Legion, Scavengers, and Other faction units are not listed on the beyondallreason.info
unit pages, so they have no entries in this file. Those units fall back to a
faction-colored gradient background with a generic unit-type icon in `UnitOverviewCard.vue`.

---

## How images are loaded

- `unit-images.json` is **bundled into the client** at build time (static import in
  `UnitOverviewCard.vue`)
- The actual image files are **fetched at runtime** from the Webflow CDN
- Users need an internet connection to see unit images
- Offline users see the gradient fallback — no errors

The Webflow CDN domain is explicitly allowed in the Electron Content Security Policy
in `src/main/main.ts`:

```ts
"img-src": [..., "https://cdn.prod.website-files.com"]
```

---

## Risk: URL stability

These are Webflow CMS CDN URLs. If beyondallreason.info ever:
- Rebuilds their Webflow site
- Re-uploads the images
- Migrates off Webflow

...the hashes in the URLs will change and all images will 404. The app will fall back
to gradients silently, but the JSON will need to be regenerated.

---

## How to regenerate this file

Scrape all unit category pages on beyondallreason.info and extract AVIF + WebP URL
pairs for each unit, keyed by the unit codename found in the WebP filename.

Pages to scrape (Armada):
- /units/armada-bots, /units/armada-vehicles, /units/armada-aircraft
- /units/armada-ships, /units/armada-hovercraft, /units/armada-factories
- /units/armada-defense-buildings, /units/armada-buildings

Pages to scrape (Cortex):
- /units/cortex-bots, /units/cortex-vehicles, /units/cortex-aircraft
- /units/cortex-ships, /units/cortex-hovercraft, /units/cortex-factories
- /units/cortex-defense-buildings, /units/cortex-buildings

The final JSON structure per entry:
```json
"unitcodename": {
  "icon": "https://cdn.prod.website-files.com/.../avif-render-url",
  "image": "https://cdn.prod.website-files.com/.../webp-icon-url"
}
```

---

## Better long-term alternatives

1. **Render from GLB models** — The game ships 3D models (used by `Unit3DViewer.vue`).
   An offscreen Three.js renderer could generate thumbnails from these directly,
   giving full coverage for all factions with no external CDN dependency.

2. **Extract unitpics from game archive** — The game's SDP/pool files contain
   `unitpics/{unitName}.png` strategic icons for every unit. These could be read
   via an IPC method (similar to how map preview images are extracted) and served
   as blobs to the renderer — fully offline and complete.
