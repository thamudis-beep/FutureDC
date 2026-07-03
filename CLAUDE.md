# CLAUDE.md — The Future of Data Centers

An animated, keyboard-driven **web presentation** on how the entire
data-center stack is being redesigned at once. Vite + React + Tailwind,
deployed on Vercel.

## Architecture

- **Fixed design canvas.** Slides are authored at 1440×900 and scaled to
  fit any viewport (`src/deck/Deck.jsx`), so pixel-precise layouts survive
  on any screen.
- **Deck engine** (`src/deck/Deck.jsx`): multi-slide navigation with
  *fragments* (intra-slide reveals), keyboard + click + URL-hash
  deep-linking (`#2.4` = slide 2, reveal 3), an overview grid, and a
  light/dark toggle.
- **Slides** (`src/slides/`): each is a component taking a `step` prop.
  Register order in `src/slides/registry.js`.

```
index.html                 fonts + <title> + theme bootstrap
src/
  main.jsx                 React entry
  App.jsx                  mounts <Deck slides={slides} />
  index.css                theme tokens (light/dark) + deck keyframes
  deck/Deck.jsx            nav engine, scaling, chrome, overview
  slides/
    registry.js            the ordered slide list
    primitives.jsx         Reveal, Cap, Chip, EqBox, icons, color tones
    TitleSlide.jsx         cover
    StackRebuildSlide.jsx  "Seven layers, rebuilt three times"
    ClosingSlide.jsx       closing
```

## Theming

Colors are CSS variables defined in `src/index.css`, exposed to Tailwind in
`tailwind.config.js`:

- Neutrals: `--bg*` / `--text*` (light + dark).
- Era accents: `--e1` (steel), `--e2` (amber), `--e3` (cyan), `--dead`.

Every slide is light/dark reactive with no per-slide theme code. In JS use
the `solid(tone)` / `tint(tone, alpha)` helpers from `primitives.jsx`
(a `tone` is a variable name, e.g. `"--e2"`).

## Add a slide

1. Create `src/slides/MySlide.jsx` exporting a component with a `step` prop.
2. Optionally set `MySlide.steps = N` (reveals) and `MySlide.title = "..."`.
3. Import it into `src/slides/registry.js` and add it to the `slides` array.

## Commands

```bash
npm install
npm run dev       # local dev server
npm run build     # -> dist/  (must pass before deploy)
npm run preview   # serve the production build
```

## Deploy

Vercel builds `npm install && npm run build` and serves `dist/`
(`vercel.json`). The production URL tracks the **`master`** branch — changes
must land on `master` to appear there. There is no backend and no auth gate.
