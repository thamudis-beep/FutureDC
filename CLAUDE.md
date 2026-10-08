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

Three views, hash-routed, in one file.

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

Both 3D scenes annotate themselves the same way (see the orbital scene
for the mechanism): a stop with a note flashes its part, then a ring, a
leader and a corner card; dimension lines where a size is the point. The
glow is one amber in both scenes (`noteColor` 0xe0a355): the user liked
the footprint's amber over the orbital scene's cyan and asked for the
same in both.
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
stops are the storyline in order — the Cloud era's metro block, meet-me
room, colo cage, regional campus, cold aisle and the fiber that ties them
→ the 1 GW campus, its data hall, gas turbines, BESS and grid → the AGI
frame: nuclear plant, 1 MW hall, long haul, inference edge, cabinets,
physical AI, orbital — and the inspect chips and in-scene pins (`SPOTS`)
are those same stops. Framings for the two rebuilt eras are written as
`eye(id,name,era,camera,target)` — the camera and what it looks at, in
world units — because the plan gives cameras, not orbits. Any drag,
wheel, chip or key pauses; space resumes; keys 1 / 2 / 3 jump eras. All chrome
is DOM over the canvas, and every framing is {target, half-width, half-height,
yaw, pitch} — the radius is derived from the panel's aspect, not baked in.
The stage pedestals are 60×40, 92×66 and 150×76; the rail is 86 deep so the
long-haul conduit at z = −41 clears the world map. Each stage groups the
parts a note can light under `userData.parts` (the colo's building and
racks; the campus's grid, gas, bess, bld, hall, cool; the planet's fab,
plant, mono, fab, cities, cab, phys, orb) and `NOTES` names them by stop. Figures on
the cards are the user's (1 GW IT, ~1.2 GW facility, ~7,100 racks at
~140 kW, 34 × 35 MW, 120 containers, ~440 racks · ~62 MW per hall); the
rest is a line of what the thing is, kept general — no vendor SKU on the
campus card ("keep more general"), no "gas is prime, grid is the tie".
The campus stop carries `tags`, small dot-and-label marks in the scene
(the rig projects them like dims), one on each building, the coolers, the
gas turbines, the BESS and the substation, so the whole build reads from
the one aerial. Gas turbines and the battery yard are separate stops with
their own cards (BESS: load shaping, ramp and backup on the MV bus). The
Today chips are 1 GW campus · Data hall · Gas turbines · BESS · Grid. The rig for this scene runs a log depth buffer
with near .02 and `minR` .25 so the camera can stand inside a hall at
model scale.

**The Cloud stage is late cloud, 2012–2022, to the user's plan**, built
quickly on purpose ("the cloud stuff needs to be quick"): two places tied
by one fiber path, on a 1000 × 667 m lawn at SC = 60/1000 (`WC(x,y,z)`
maps metres to world; the campus origin is `CP`). Place 1, the city
block, 200 × 120 at the south-west: the street with manholes every 40 m
and the curb vault; the carrier hotel 40 × 50 × 72, 18 floors of brick
with punched windows, floor 7 cut open as the meet-me room (fiber panels
down both long walls, four racks in the middle, trays and aqua bundles
across the ceiling), two cooling towers, a generator and two dishes on
the roof; the colo 60 × 40 × 16, windowless but the lobby, eight diesels
in the rear yard, two chillers on the side pad, top floor cut open as
chain-link cages of 8–20 racks with CRAC units at the ends. Place 2, the
regional campus, 700 × 500 at (300,100): a 230 kV substation with one
transformer and a dead-end tower, the fiber hut by the gate, twenty
diesels idle on the south fence, four buildings 90 × 50 × 16 with cooling
towers on a pad at the east end, the office knuckle on A, parking, an
18 m spine road, trees on the fence; A is cut open with 30 rows of 20
standard 42U racks (0.6 × 1.0 × 2.1, perforated doors, no manifold) and a
CRAH gallery. The joint is one lit aqua duct with pulses: the hotel's
vault, under the street, a splice, the fiber hut, out the back. Utility
power only, diesel backup, air and towers: no gas island, no BESS, no
liquid racks. The cards carry the plan's figures (18 floors · 20 MW shared;
3 stories · 16 MW; 16-rack cages, 4–8 kW; 4 × 48 MW · 192 MW; ~24,000
racks · 8 kW; 28 diesels), and the campus stop tags every yard.

**The Today stage is a real 1 GW campus**, built to the user's site plan,
not a diagram: metres, Y up, origin at the south-west corner of a
1400 × 900 m equipment pad, north away from the viewer, on the 92 × 66
pedestal at S = 92/1400 (`W(x,y,z)` maps campus metres to world; `AISLE`
is the cold aisle the hall camera stands in). 345 kV substation
(280 × 180, two main transformers, a bus on steel, eight breakers, the
dead-end tower where the line lands) · gas island (520 × 220, 34
aeroderivative packages in two rows of 17 at 28 m centres, each 16 × 4 × 4
with a 12 m stack and an SCR box, a fire road round the rows, a control
building, the metering skid and the fire-water tank) · battery yard
(160 × 100, 120 white containers 6 × 2.5 × 2.8 in 4 m aisles) · four
buildings 220 × 90 × 12 in two rows of two, each with its electrical pad
on the west (transformers, switchgear, a local battery line) and its dry
cooler yard 40 m east (closed loop, no plume, pipe rack over the road) ·
admin and NOC at the south gate · a 24 m spine road with the MV duct bank
under it. Building A is cut open: four halls of 448 racks (eight rows of 56 at
4.2 m pitch, fronts to the cold aisles, built with `rackField` in two
groups turned ±90° so the kit's fronts face ±x; each rack 0.6 × 1.1 × 2.5
with its trays, LEDs, the NVSwitch band and a manifold each side; over
every row a fibre tray and a busway with a live strip, headers beneath;
lamps across the hall; `shadow:false` on the racks and nine units a rack,
because eighteen put the scene past 1 M triangles), a support strip along
the north wall with the CDUs and their risers, the leaf switches and the
fibre tray. "Simple blocks" for the racks were rejected. The user has
stood in these halls: "a shitton of fiber and plumbing", so hall A also
carries three fiber trunks on every row tray, a cross tray from each row
to the support strip, a drop to every rack in the near hall, a supply
and return branch to every rack, and two thick mains along the support
strip to the CDUs. `rackField` scales its rails, LEDs, ports and
manifolds with the rack width (`kk`) and caps LEDs at a fifth of a unit,
or a 0.6 m rack at arm's length wears 7 cm lamps. No NVLink is drawn;
it never leaves the rack. Gas is the prime source and the grid the tie,
so there are no gensets on the building face and no cooling towers. The
film's campus chapter glides from the aerial to a low oblique over
Building A's corner looking up the spine road to the stacks; at this
model scale a 2 m eye on the road sees a plain, which was tried. The
hall chapter is a dolly up a cold aisle; the power chapter a glide low
along the turbine row. The old campus kit (combined-cycle trains, gensets,
pylons, the eight-hall grid) is gone with it.

The AGI stage is one frame, to the user's brief: few plants, many edges,
cabinets at the machines, a thin string overhead. The camera stands over
a port depot. Foreground, 1:1: two warehouses with eight cabinets on their
walls, container stacks and a gantry, the truck yard with two trucks and
five AGVs on their loops, a charging row with six vans, one humanoid, two
drones; a hairline from every cabinet to the nearest machine and a live
hairline from the lead truck to its nearest cabinet, and from the
cabinets to the nearest inference building — the last hop. Midground,
1:4: twelve inference buildings on one shell (40 × 30 × 10, cooler pads,
utility only), hairlines between them and pulses back to the plant. Far,
1:10, on the horizon: the nuclear training plant — six reactor modules,
one landmark dome, low turbine halls, dry coolers, a 500 kV lattice, a
small battery field, ten halls with the near one cut open as sixty
immersion tubs at 1 MW on thick manifolds (`TUBS` is what glows, not the
slab), one optical dish at the fence, and no stacks, no plume. Above:
twenty craft on a ring — bus, one solar wing, a radiator larger than the
bus — hairline laser to the neighbour and two downlinks, to the plant dish
and one edge roof. Thick cyan on the long haul, hairline cyan on the last
hop; nothing in the yard links to a reactor or a satellite. The world
map, the real-coordinate sites, the SMR diorama and the three plinths are
gone with it. Earlier rejects still stand: a wireframe globe on a stem, a
circular site with glowing pads, a race-drone flythrough.

**The orbital scene** (`mountOrbit`, Data Center topic 05) shares the kit and
rig with the first (`sceneKit`, `sceneRig`: renderer, film camera, chapters,
pins, chrome, dispose — a scene builds its world and hands the rig its stops).
It is built to the user's reference video and the published AI1 spec sheet,
not invented. Axes: X along the mast, Y along the orbit, Z toward the sun.
Geometry, settled after three wrong tries: two wings in the X–Y plane facing
the sun (`WL` 31 × `WH` 18.5 each, three strips, 74 m tip to tip, mast on
their sun face, stopped short of the hub); the radiator a single thin
aluminium sheet, `RH` 24 tall × `RD` 9 wide, 6 cm thick — taller than the
wings and about 80% of the rack's length, the proportions the user read
off the references (that is more area than the spec's 110 m²; the eye
won), standing in the Y–Z plane — long axis along the orbit, EDGE-ON TO THE SUN, so it is a thin
blade from the sun side and a full face looking down the mast; a boom down
its centre, flush with its ends. NOTHING STICKS OUT: no boom past the
sheet, no spar past a wing edge, no mast past a wing tip — the user calls
every one of them a stick. There is a compute rack ON EACH FACE OF THE SHEET (+X and −X, mirrored,
both docking together), and each is an OPEN FRAME — rails, ties, pipes and
the cold plates, never a solid block beneath the trays. Each rack:
its rails run ALONG Z (the sun axis), across the sheet's short edge, wider
than the sheet so casings hang past it on both sides; the casings' lids face
+Y (along the sheet's long axis) and the casings SLIDE OUT ALONG +X, away
from the sheet's face, and dock back toward it — as the compute close-up
shows, ribbed sheet behind, rails across, casings coming out toward the
viewer. The hub group carries the basis (local X→−Z, Y→−X, Z→+Y) and its
framings go through `hw()`/`hd()` with `YUP`. The three wrong tries: a wall
beside the rack parallel to the mast; the sheet in the wing plane with the
rack piercing it; the rack on the face but sliding along the sheet. The front-on reference shows no wings
(they are edge-on) and the rack crossing the sheet face horizontally — that
is the test. The rack is satin-steel casings on two graphite rails over a
deep chassis, coolant mains with U-bends, laser terminals fore and aft.
Wings are blue-grey cells with a broad specular band and two dark seams.
Rack shots hang the camera with Z up
as the video does; orbit shots with Y up, Earth below; each framing carries
its `up` and the crane blends it. Two parts on the bar — Satellite,
Constellation — and four chips in story order: Compute · Solar · Radiator
| Constellation. Never a chip order that doubles back on the film; the
user called the old Solar, Radiator · The rack "going back and forth". Play resumes from the stop you are on: a chip or era button sets
the film's chapter index, and play only restarts the chapter when the
camera is somewhere outside the film. The chapters are the storyline, in the user's order: the whole satellite
first (a slow push in) → the rack (a dolly
along the rails) → the GPUs (the sleds travel in and out on their rails, as
in the video) → solar (a flyover down the wing) →
radiator (a flyover that ends looking along its edge, so the sheet reads
thin) → laser links (the neighbours, close, with the "Laser connectivity" callout:
how they communicate) → the constellation (the string
on the horizon, held: a cluster of ten, boxed, pooling compute over ~10 Tb/s
between them) → the orbital design, the one planet shot, last. That last
chapter is the user's SpaceX reference: the whole Earth with the AI
constellation's dawn-dusk sun-synchronous half as one dense near-polar band
in cyan, its lower-inclination half as fainter cyan shells, and Starlink
apart in grey, lower, at a spread of inclinations (`shells`: a circle
tilted by inclination about X then swung by RAAN about the pole, Y; the
hero's own plane is inclination 90°, RAAN 0, normal along the sun — a
dawn-dusk plane riding the terminator, which is why the band crosses the
pole where the hero sits). The inclinations and plane counts are
illustrative geometry, not figures; the only figures on the card are the
user's. The layer fades in for that chapter only (`orbA`), because every
sun-synchronous plane crosses the pole and would crowd the hero's close-ups.
The camera for it looks about 100° off the sun so the sun stays out of
frame and the band reads narrow, edge-on. After it, one more chapter,
`gw`: the same planet shifted left so the math panel (40 · 125 KW · 5 MW
· 1 GW) has the right of the frame — the maths is the last word, after
the orbits, never beside the cluster; `panelFor` names the stops that show
it. The solar close-up was slow on the user's device (an Apple one, going
by the screen recordings) while every other chapter was fine. The cause:
the scene ran a logarithmic depth buffer, which in three r159 writes
depth from the fragment shader, and that defeats early depth and the
hidden-surface removal of tile GPUs — every overlapped pixel is shaded
in full. The solar close-up is the one frame where stacked surfaces (the
cell face, a dark back plate 8 cm behind it, the other wing, the sheet)
fill the whole screen. So: NO LOG DEPTH in this scene. A plain 24-bit
depth buffer with near .5 holds because the cloud sphere, 96 m over a
24 km Earth, was folded into the Earth shader (`tCloud`, `cloudOff` for
its drift) — nothing else sits within depth precision of anything at
27 km. Each wing is one mesh (a material array: cells on the sun face,
the dark back on the rest), no shadow receive on the cells. The scene
also keeps PCF (not soft) shadows, a 1.5 pixel-ratio cap and anisotropy
2 on the cell texture. Swiftshader cannot see this class of cost
(it is vertex-bound here); reason from the GPU, then verify the look. The look is the user's second
reference video (the SpaceX Starmind render): every orbit a DOTTED TRACK
of points, no solid lines, the AI constellation one dense near-polar band
of dawn-dusk planes in a pale blue-cyan, Starlink a lower lattice at a
spread of inclinations in a dim blue-grey, dense and plainly visible as
the mid-latitude basket under the band (the user: "also do want to show
the starlinks in the lower orbit, like in the video"), nothing else; and the
Earth goes dark for the chapter (`dim` uniforms on the Earth and
atmosphere, clouds fading) so the tracks carry the picture. The card
is the v98 wording the user asked back for after a cut: half the fleet in
dawn-dusk sun-synchronous orbits, always in sunlight, steady power; the
rest in lower shells to load-balance; a two-tone legend. The "Starlink
flies apart" sentence was cut. The band must stay the subject: brighter,
denser and bluer than Starlink (`orbAI` at .62, `orbSL` at .16), because
one pass with Starlink at .30 "took over the whole thing". It is the one time the film pulls
out to the planet; a whole-orbit view in the middle of the story then a
zoom back in still reads as a mistake. A
chapter may glide from its framing to a second one over its hold
(`CHAPTERS[i][2]`); a chapter with no name lights the chip it sits `under`.
The look is the reference's: monochrome studio metal — graphite rails and
ties, satin-steel casings (thick, chamfered nose, `lidShape` extruded to
0.5 m), the radiator a quiet light-grey sheet with fine horizontal flow
lines (`sheetTex`) — under a neutral white key, two soft fills and a dark
grey studio environment with one broad soft sun. No warm sun tint, no white
plastic, no blue tint on the hardware; the blue-grey is the cells only.
The rig calls `cfg.onChapter(framing)` as each chapter begins; the orbital
scene uses it to dock the casings: three white lids slide in from outside
along the rails together and stay, on the rack chapter, exactly as the video
does it — never in-and-out, never oscillating. Compute is one chip, "The
rack": the docking, then a dolly along the rails to the cold plates. The GPU shot is
low along the rails with the silver cold plates (serpentine channel, brushed
aluminium, `plateTex`) exposed beneath the lids; the lids are extruded from
`lidShape`, a flat slab with a wedge leading edge, with dogbone tie bars and
bolts across every seam. Motion runs on the film's own accumulated `dt`, not
the wall clock, so a slow renderer keeps camera and casings in step. No pins in this scene — at rack scale they read as
props.
Instead the scene annotates itself: `cfg.notes` maps a stop id to a note —
`at` (the world point the ring sits on), `glow` (the objects that light
up: `buildSat` groups its parts as `userData.parts` — mast, wings, sheet,
hubs by side — so a note can name one), `slot` (which corner the card
takes), `title`, `desc` and `rows` (a row's third entry is a legend
colour). The highlight is the iso-glow look the user pointed at: the thing
ITSELF lights up — its edges as luminous lines, its body barely lifted, a
soft bloom around it — never a box or shell around it (the fresnel box was
tried and rejected). `K.glow` gives every mesh under the named objects a
proxy child on layer 1 (edges as `EdgesGeometry` lines, body as an additive
fill; instanced meshes get an instanced proxy sharing the matrices), and
the rig's selective bloom (`cfg.bloom`, three core only: the scene's depth
rendered black, the layer-1 proxies over it, blurred small, added back)
makes the halo. The fill must stay tiny (`.02` on screen, `.012` into the
bloom): a fill of `.04` turned a sunlit wing into a flat cyan slab,
measured, because the bloom of a large face adds back its whole mean.
Sky objects (stars, sun sprites, orbit shells) sit on layer 2 so the
black pass skips them. The glow is a FLASH, not a state: as the crane
settles on the thing it comes on in a third of a second, holds about a
second, and is gone a second later (the user: "subtle, don't overdo it,
a quick on and off"). The card and the dimension lines stay. A note is
for its own stop only — no `under` fallback, or the constellation card
showed twice (laser links, then the string). A note may flash its
objects IN SEQUENCE (`seq`: seconds between them, each object its own
glow): the compute stop runs down the rack's eight casings one after
another, because lighting the whole hub at once "looked like I found
gold". Once the
crane has settled, a ring sits on the thing with a leader to a card in its
corner (DOM, like the rest of the chrome): what it is and its figures, the
user's published AI1 sheet, cut back three times at the user's ask: the
satellite card is its title alone; compute is "NVIDIA Vera Rubin NVL72."
with no "rack"; solar is a title; the radiator is "Rejects heat into the
vacuum of space."; backhaul is "Laser links", never "to Starlink"; the
specs (kW, m², W/m², kW/ton) are gone. The dimensions survive as DIMENSION LINES in the scene instead
(`dims`: two world points and a figure — the rig projects them, clips the
line to the panel, ticks the ends that are in view and sets the figure at
the visible middle, on the side away from the thing): the 75 m · 246 ft
wingspan along the wings' lower edge, the 30 m · 98 ft deployed height
along the sheet's edge. `RH` is 30 for that reason: the sheet is the
published deployed height, so the line is true. Then the cluster card
(~10 satellites, ~10 Tb/s between them, laser backhaul to Starlink) and
the orbital design (a two-tone legend). A chapter without a note of its own (the GPUs, the
laser links) shows its `under` stop's. Cards are pinned to corners, never
beside the ring, so they never cover the thing they annotate; the slot is
chosen per stop by looking at the framing. The user asked for isoglow
(isoglow.dev) for the highlight; the site was unreachable from the
container, as was the iso-glow skill tarball at iso-glow.vercel.app (403
through the proxy), and there is no npm package by that name, so the glow is
built in, and takes no dependency. Moving the cursor never pauses the film: only a drag with the button
down, a real wheel (40 px accumulated), a chip or a key does. A math panel (the user's
figures: 40 per launch, 125 KW, 5 MW per launch, 1 GW = 200 launches ·
8,000; KW is the user's spelling, kept for MW/GW consistency) shows for the constellation group. The Earth is NASA Blue Marble /
Black Marble / water mask / clouds (`public/img/earth/`, see SOURCE.md) on a
stage sphere of R 24 km with the string of satellites 520 m apart on the
horizon (a stage spacing so the string reads as satellites, not dots); the satellite is over-scale against it on purpose. The laser links
are one-pixel lines at 7% opacity with one short burst of traffic per link
every 6–15 s — faint and intermittent, never a steady line that reads as a
cable. Never an
equirectangular land-only texture, never a launch stack, never a spacing
that wraps the orbit.

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
