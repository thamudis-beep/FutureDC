# The Future of Data Centers

An animated, keyboard-driven web presentation on how the entire data-center
stack — from workloads down to the power plant — is being redesigned at once.

Built with **Vite + React + Tailwind**. Slides are authored on a fixed design
canvas (1440×900) and scaled to fit any screen, so pixel-precise layouts stay
intact on a laptop, a projector, or a phone.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the production build
```

## Controls

| Key / action            | Effect                              |
|-------------------------|-------------------------------------|
| `→` `Space` `Enter` · click | advance (steps through a slide's reveals, then moves on) |
| `←`                     | back                                |
| `Home` / `End`          | first / last slide                  |
| `O`                     | overview grid (click a slide to jump) |
| `D`                     | toggle dark / light                 |
| `F`                     | fullscreen                          |

The URL hash tracks position (`#2.3` = slide 2, reveal 3) so any moment is
linkable and survives a refresh.

## Structure

```
index.html                 fonts + title + theme bootstrap
src/
  main.jsx                 React entry
  App.jsx                  mounts the deck
  index.css                theme tokens (light/dark) + deck keyframes
  deck/
    Deck.jsx               nav engine, fit-to-viewport scaling, chrome, overview
  slides/
    registry.js            the slide list, in order
    primitives.jsx         shared building blocks (Reveal, Chip, EqBox, icons, color tones)
    TitleSlide.jsx         cover (placeholder)
    StackRebuildSlide.jsx  "Seven layers, rebuilt three times"
    ClosingSlide.jsx       closing (placeholder)
```

## Add a slide

1. Create `src/slides/MySlide.jsx` exporting a component that takes a `step` prop.
2. Optionally set `MySlide.steps = N` (intra-slide reveals) and `MySlide.title = "..."`.
3. Import it into `src/slides/registry.js` and drop it into the `slides` array.

Colors come from theme tokens via CSS variables (`--e1/--e2/--e3` era accents,
plus the neutral `--text` / `--bg` scale), so every slide is light/dark reactive
with no per-slide theme code — use the `solid()` / `tint()` helpers from
`primitives.jsx`.
