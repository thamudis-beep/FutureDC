# CLAUDE.md — Future of the Data Center

An interactive, coded presentation for an investor audience. It replaces a
PowerPoint. It is judged the way a deck by a good analyst is judged: is the
argument right, is it specific, does the picture carry it.

**The deliverable is `public/stack.html` — one self-contained file.** The Vite
app in `src/` is a separate legacy deck served at `/deck`; the homepage is
`stack.html` via the `/` rewrite in `vercel.json`.

---

## The bar: no slop

Slop is anything that looks like work but does not add information. It is the
default failure mode here and it has been the main complaint. Concretely:

**Never invent a number.** If a figure did not come from the user, a cited
source, or arithmetic on those, it does not go on the page. No "35% vs 85%"
utilisation, no "2.4× faster", no plausible-sounding percentages. If the point
needs a magnitude and none exists, express it qualitatively (a wide band vs a
narrow band) and say the size is unsettled. When a number is a placeholder, say
so in the reply — do not let it pass as fact.

**One idea per diagram.** If a diagram has three bands each making a different
argument, it is three diagrams or it is one diagram plus cut material. Cramming
reads as padding.

**One unit per row, one unit per axis.** A comparison across time must compare
the same kind of thing at each step. `~5 GW/yr → Gas + solar → 100 GW/yr` is not
a story, it is a rate, a fuel type, and a rate. Every row of a matrix declares
the dimension it measures, and holds it.

**No explainer text.** No subtitles under headings, no "what it earns" under
Revenue, no bullet lists restating the diagram, no era pills repeating the
columns. The audience is sophisticated. The diagram carries the argument; a
single line of consequence underneath is the most that is ever warranted.

**Be technical where the subject is technical.** Naming a layer "inference" is
not content. Continuous batching, paged KV cache, prefill/decode disaggregation,
speculative decoding, FP8 — that is content. Generic descriptions of technical
work are the most common form of slop in this project.

**Use real data.** Real Natural Earth geometry, not hand-drawn blobs. Real
projected coordinates for real places. Real slide images when the user supplies
them. Anything hand-faked will be spotted.

**Delete dead code in the same pass.** Replacing a diagram means removing the
one it replaced. Shadowed duplicate definitions are invisible in the UI and
still slop.

---

## Working method

**Verify by screenshot before claiming anything is done.** Headless Chromium is
at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`; `playwright` is
installed with `--no-save`, so reinstall it if a later `npm install` prunes it.
Render the actual page, read the image, and look for: text overflowing its box,
labels colliding with geometry, content clipped at the panel edge, elements
overlapping the heading. These are the recurring defects.

```
NODE_PATH=/home/user/FutureDC/node_modules node shot.js   # run from the repo root
```

Screenshots of a `file://` URL are fine for layout. Use a local server over
`dist/` when the page loads an asset by absolute path (`/img/...`).

**Check every topic renders after touching the diagram engine.** Iterate
`LAYERS`, call each `VIZ[...]`, assert non-trivial output, and capture page
errors. A silent `ReferenceError` in one diagram is easy to miss.

**Fit is part of correctness.** The stack view must not overflow at 1280×720
through 1920×1080. Measure `scrollHeight > clientHeight` rather than eyeballing.

**Report honestly.** If a figure is illustrative, say which. If something was
cut, say so. If the user says a thing is missing that is in fact shipped, check
the running DOM, then say plainly that it is in the build and that the browser
is showing cache — the user's proxy caches hard.

---

## Deploy

Production tracks **`master`**. Every change ships as: build → commit → push the
feature branch → fast-forward `master` → push.

```
npm run build
git push -u origin claude/datacenter-presentation-migrate-hdwtuf
git fetch origin master && git branch -f master HEAD && git push origin master
```

Bump the version tag in the footer (`.ver`) on every deploy — `v25 · …`. It is
the only way the user can tell a fresh build from a cached one, and it is the
first thing to point at when they report seeing something stale.

Never run `pkill` in the same command as a commit; it kills the shell first.

---

## Structure

Three views, hash-routed, in one file.

- **Home** — title, a pill CTA, two cards that preview real content.
- **Data Center 101** (`#matrix`) — the master grid: the stack down the Y axis,
  time across the X (Internet 2023 · AI 2026 · AGI 2031). Every row names its
  dimension. Rows are numbered bottom-up (1A/1B/1C · 2A/2B/2C · 3 · 4) and click
  through into the matching layer.
- **The Stack** (`#stack`) — three stages that animate as one motion:
  `s0` the stack centred → `s1` it slides left, topics appear → `s2` it shrinks
  further, the topic's diagram takes the page. Only `left` and `transform`
  animate; never animate a grid track and the element's internal layout at once
  or it drifts the wrong way first.

Layers: **Power** (6 topics) · **Compute** (7) · **Data Center** (7) ·
**Applications** (3).

---

## Diagrams

Each topic renders one diagram, either generated SVG (`viz:'name'` → `VIZ.name`)
or a real image (`img:'/img/name.jpg'`). Helpers: `SV(body)` for the standard
1000×460 canvas, `SVh(body,h)` when a diagram genuinely needs more height, plus
`T` text, `B` box, `LN` line, `ARROW`, `RACK`, `CHIP`.

Palette is `V` — `blue pur pink yel grey red amber cyan green ink dim`. Era
colours are fixed and mean the same thing everywhere: **grey = past, amber =
today, cyan = future**. Layer accents: Power amber, Compute cyan, Data Center
blue, Applications violet.

Icons live in `G` (26px line-art, one per topic via `TICON`) and animate —
orbits spin, chains draw, batteries charge in sequence. Animations that carry
their own resting state must be reset under `prefers-reduced-motion`, or icons
render invisible or squashed.

The world map is real: `world-atlas` 110m TopoJSON, Natural Earth projection,
Antarctica dropped, fitted to the viewBox and rounded to integers, generated
offline and embedded as `MAP` + `HUBS`. Regenerate with `d3-geo` +
`topojson-client` if the projection or the plotted hubs change; do not hand-draw
coastlines.

---

## Visual language

Dark, serious, technical. Near-black ground, a fine LED-pixel field behind
everything, Geist for type, IBM Plex Mono for labels and figures. Content panels
sit on near-opaque blurred surfaces so nothing competes with the background.
Modules fill the viewport vertically.

Not: neon glow, purple gradients, cream atmospheric cards, decorative 3D. All of
those were tried and rejected.
