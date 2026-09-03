# Future of the Data Center

An interactive, coded presentation for an investor audience. It replaces a
PowerPoint.

**The site is one file: `public/index.html`.** No build step, no framework, no
bundler. It carries its own CSS, its own SVG diagram engine, its own canvas
pixel field, its embedded map geometry, and one WebGL scene. The only things it
loads from outside are Geist and IBM Plex Mono from Google Fonts, `public/img/`,
and `public/vendor/three.min.js` — vendored, and fetched only when the one 3D
topic is opened.

## Run

```bash
npm run dev      # serves public/ on http://localhost:3000
```

Or just open `public/index.html` in a browser — every route works from
`file://`, including the 3D topic, which loads three.js by relative path.

## Views

Three views, hash-routed.

| Route             | View                                                  |
|-------------------|-------------------------------------------------------|
| `#` (default)     | Home — title, CTA, two cards previewing real content   |
| `#matrix`         | The Atlas — the stack down Y, time across X            |
| `#stack/<layer>`  | Inside the Data Center — a layer's topics              |
| `#stack/<layer>/<n>` | one topic and its diagram                           |

Layers, bottom to top: Power (6 topics) · Compute (7) · Data Center (7) ·
Applications (3).

## Deploy

Vercel serves `public/` as a static directory — see `vercel.json`. Production
tracks `master`; pushing to it deploys. Bump the version tag in the footer
(`.ver`) on every deploy so a stale cache is obvious.

## Editing

`CLAUDE.md` is the standard this page is held to — what counts as slop, how
diagrams are built, how to verify by screenshot before claiming anything works.
Read it before changing the page.
