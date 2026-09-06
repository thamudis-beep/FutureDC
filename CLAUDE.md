# CLAUDE.md — Future of the Data Center

An interactive, coded presentation for an investor audience. It replaces a
PowerPoint. It is judged the way a deck by a good analyst is judged: is the
argument right, is it specific, does the picture carry it.

**The site is one file: `public/index.html`.** There is no build step, no
framework, no bundler — Vercel serves `public/` as a static directory. Nothing
else in the repo ships. If a change does not land in that file, in
`public/img/`, or in `public/vendor/`, it does not reach production.

`public/vendor/three.min.js` is the one vendored dependency — three r159, UMD,
loaded lazily by the single 3D topic and by nothing else. It is vendored rather
than pulled from a CDN so the page stays self-contained and renders offline.
Do not add a second copy, and do not reach for a bundler on its account.

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
`public/` when the page loads an asset by absolute path (`/img/...`).

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

Production tracks **`master`**. There is nothing to build. Every change ships
as: commit → push the feature branch → fast-forward `master` → push.

```
git push -u origin claude/datacenter-presentation-migrate-hdwtuf
git fetch origin master && git branch -f master HEAD && git push origin master
```

Bump the version tag in the footer (`.ver`) on every deploy — `v25 · …`. It is
the only way the user can tell a fresh build from a cached one, and it is the
first thing to point at when they report seeing something stale.

Never run `pkill` in the same command as a commit; it kills the shell first.

---

## Structure

Four views, hash-routed, in one file.

- **Home** — title, a pill CTA, two cards that preview real content.
- **The Atlas** (`#matrix`) — the master grid: the stack down the Y axis, time
  across the X (Cloud 2023 · Today 2026 · AGI 2031). Every row names its
  dimension and holds one unit across all three eras. Rows are numbered
  bottom-up (1A/1B · 2A/2B/2C · 3A/3B · 4) and click through into the matching
  layer. It must fit one view — cell metrics scale with viewport height.
- **Inside the Data Center** (`#stack`) — three stages that animate as one motion:
  `s0` the stack centred → `s1` it slides left, topics appear → `s2` it shrinks
  further, the topic's diagram takes the page. Only `left` and `transform`
  animate; never animate a grid track and the element's internal layout at once
  or it drifts the wrong way first.

Layers: **Power** (6 topics) · **Compute** (7) · **Data Center** (7) ·
**Applications** (3).
- **The AI World Model** (`#model/<n>`) — a first-principles model of AI
  compute, power, silicon and return on capital: physics, then production,
  then finance. Capex and share mix are outputs; "$4T" is a claim under test.
  `WM.IN` holds every input with a tag (`K` constant · `D` disclosure · `E`
  engineering estimate with a range · `J` judgment); `WM.calc` derives
  everything else; `SHEET.*` renders the book: one MW, watts → capex (with
  the bottleneck ranking), rent → the stack (with the by-year copper strip),
  the Challenger, and the inputs ledger last. One figure grammar: vertical
  columns, one accent, a dashed rule for the reference, one line of
  consequence, never a note; a log axis only where the spread is over a
  hundredfold, and then the axis says so. The rail carries four judgments —
  fleet under test, hurdle, silicon life, realised $/MTok; the three layer
  margins live on the sheet that uses them. It is a global model: no country
  is singled out. Deleting is the default: a sheet that only restates a
  gauge, and a memo that restates a sheet, do not exist. Add an input by
  tagging it; never type a derived number into a sheet.

  Every label in this view is plain language: what it makes, what it costs,
  does it pay, what is short. Code names stay in the code. On the page the
  sheets are "What one gigawatt does", "How much gets built", "Does it pay?",
  "Elon's numbers", "Every number, sourced".

  The front door of that view is **the hall** (`mountHall`; on the page, "One
  gigawatt, live"): a cutaway of one
  energized MW with four systems docked to it — watts in (pylon → transformer →
  bus duct whose thickness is that year's deliverable GW, a grey ghost duct for
  what the dollars want), silicon in (wafer → CoWoS press → HBM → the racks),
  tokens out (three streams whose density is tok/s per MW), dollars out (the
  stack as floors, each 1/(1−g) tall; below coverage 1.0 the upper floors go
  translucent and a crack runs to the slab). Three cameras: the MW, the works
  (six bays, one per year, sized by new GW; a bay pours only if the deliverable
  GW exist and the MW pays its rent inside the tested fleet), and the scarce
  atom (everything steel except the binding joint, which is copper and moves
  with the year). Click any joint for a plate with four fields only:
  time-to-add, idiot index, who collects if it binds, the observable. Five
  gauges are the observables at their last disclosed values — they are not
  feeds yet, and the page says so. `scene.add()` returns the scene: rotate a
  part before adding it, never after. The world camera and the orbital bay
  are deliberately not built; the build order says the MW pays rent first.

---

## Diagrams

Each topic renders one diagram: generated SVG (`viz:'name'` → `VIZ.name`), a real
image (`img:'/img/name.jpg'`), or the one live 3D scene (`scene:'eras'`). Helpers: `SV(body)` for the standard
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

**The 3D scene** (`mountEras`, Data Center topic 01) is three stages on one
industrial rail with no text in the scene and the era colours carrying the
reading: grey past, amber today, cyan future. It opens on the wide shot behind
an "Enter" pill. Entering plays a film: `CHAPTERS`, each a framing and a hold.
The camera moves between framings with one crane (`flyTo`: rise, cross,
settle, smoothstep, no roll) and holds steady with the slowest drift; the
stops are the storyline in order — 3 kW CPU racks in a metro colo → the GW
campus, the NVL72 hall, grid + on-site power → connected GW sites across
countries, 1 MW racks, nuclear + SMRs, orbital + edge, physical AI — and the
inspect chips and in-scene pins (`SPOTS`) are those same stops. Any drag,
wheel, chip or key pauses; space resumes; keys 1 / 2 / 3 jump eras. All chrome
is DOM over the canvas, and every framing is {target, half-width, half-height,
yaw, pitch} — the radius is derived from the panel's aspect, not baked in.
The stage pedestals are 44×40, 92×66 and 150×76; the rail is 86 deep so the
long-haul conduit at z = −41 clears the world map.

The AGI stage is the planet, never a city block: the back of its pedestal is
the world (Natural Earth, ±60° of latitude), with GW sites at real coordinates
across countries, the fabric between them carrying one job's traffic, an
orbital layer over it and edge nodes at real cities; in front, three dioramas
at full scale — the 1 MW hall cut open, four SMR modules on one turbine hall
(nuclear is the user's call for the AGI era; the AI campus stays gas, turbines
and batteries, no cooling towers), and the physical world it powers: robot
arms on a line, humanoids, robotaxis, drones. A wireframe globe on a stem, a
circular site with glowing pads, and a race-drone flythrough were all tried
and rejected as cartoonish or unstable.

The globe in that scene is real too: `public/img/earth.png` is Natural Earth
110m land drawn equirectangular by `tools/earth-texture.js` and wrapped on a
sphere, lit by the key light so it has a terminator. The site clusters on it
are real lat/lon. Regenerate with the script; never hand-paint continents.

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
