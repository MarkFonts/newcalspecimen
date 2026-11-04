# New Cal Sans specimen

The Cal Sans page at [cal.com/font](https://cal.com/font), rebuilt from its Framer original as one
Next.js App Router route, `/font`, by Mark Davis (WORDMARK). It's written to Cal.com's own
conventions: Tailwind v4 with CSS-variable tokens, dark mode through a `.dark` class on `<html>`,
and fonts through `next/font/local`.

It's a standalone app so it can be built and checked on its own. The page itself is everything
between the site header and the footer; Cal.com's layout supplies both.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000/font
npm run build      # production build, type check included
npm run start      # serve the build
```

In dev there is a small theme switch at the bottom right (dev only, not in production builds).
`?theme=dark` in the URL does the same.

**Webpack, not Turbopack.** The Framer imports are rewritten by webpack hooks (below).
`next dev` and `next build` on Next 15 use webpack by default; don't add `--turbopack`.

## What's where

```
app/
  layout.tsx            stand-in root layout: font variables on <html>, literal @font-face block
  globals.css           tokens, breakpoints, page wrapper classes (Tailwind v4, CSS-first)
  font/page.tsx         the route: 24 sections in order; the space between them is one rule in globals.css
src/
  sections/NN-slug.tsx  one file per section; Section.tsx is the shared root element
  framer/<Name>.tsx     "use client" boundary for each Framer component
  fonts.ts              every font: next/font/local + the literal family names
  lib/clientOnly.tsx    next/dynamic with ssr: false, for WebGL and window-at-import code
  lib/useBand.ts        the breakpoint hook the src/framer/ wrappers share
  shims/framer.tsx      stand-in for the `framer` package
config/                 the two webpack loaders (below)
types/                  types for the Framer sources and for font-file imports
components/             the Framer code components this page uses, as written for Framer
assets/                 Paper Mono and Cal Anim Graph 6
fonts/                  Cal Sans 2.011 woff2: Latin subset and full; the Flex subset for HOIGrid; standin/ = their 2.001, preview only
```

The Framer components are imported from `components/*.tsx` as `@components/<File>`.

## Dropping `/font` into Cal.com's site

1. **The route.** `app/font/page.tsx` goes where your `/font` page is. `src/sections/`,
   `src/framer/`, and `src/lib/clientOnly.tsx` come with it; adjust the `@/` imports to
   your aliases.
2. **The Framer component sources.** Copy the `.tsx` files the sections import (from
   `components/`, including `Shared.tsx` and `SharedTester.tsx`) into
   one folder in your repo and point the `@components` alias at it. Don't edit them; they
   are maintained as Framer code components and get re-copied when they change.
3. **The `framer` shim.** The components `import { addPropertyControls, ControlType } from
   "framer"`. Those only feed Framer's property panel; outside Framer they mean nothing.
   `src/shims/framer.tsx` makes them inert. Alias `framer` to it (`next.config.ts`).
4. **The webpack hooks** in `next.config.ts`: the `framer` and `@components` aliases,
   `experimental.externalDir` (only needed while the sources sit outside the app), and
   `config/framer-source-loader.cjs` + `config/font-url-loader.cjs`. The source loader
   rewrites, in what webpack sees (never on disk):
   - `"https://framer.com/m/Shared-<id>.js@<hash>"` and `"…/SharedTester-…"`, Framer's
     URL imports, to the local `Shared.tsx` / `SharedTester.tsx`;
   - the jsDelivr font URLs in `Shared.tsx` (Cal Sans 2) and `HOIGrid.tsx` (Flex) to
     the local woff2 files.

   A NormalModuleReplacementPlugin can't do the first: webpack's web target externalizes
   `https://` requests before the replacement applies.
5. **Fonts.** See below.
6. **Tokens.** The page uses your semantic tokens as they are on staging (`--background`,
   `--foreground`, `--muted`, `--muted-foreground`, `--border`, `--card`, `--primary`,
   `--secondary`, `--accent`, `--ring`, `--radius`, …), through utilities such as
   `bg-background` and `text-muted-foreground`, and the section CSS modules hold the few values your set has no name for (`--fp-*`,
   scoped to their section). Bring the
   breakpoints; the rest you already have.
7. **Wrappers.** The page follows your staging markup:
   `main > article > div.comark-content.page-content > section.page-measure.section-y`.
   `page-measure` and `section-y` are your class names, but the definitions in
   `globals.css` here carry the Framer page's geometry (max-width 1801px, 12px side
   gutter, no vertical padding). Check them against yours before you delete ours.
8. **`use client`.** The page and the section files are server components. Every Framer
   component crosses into the client through its own `"use client"` file in
   `src/framer/`. Components that can't render on the server at all (AnimatedCal2's
   WebGL, anything that reads `window` when its module loads) go through `clientOnly()`,
   which is `next/dynamic` with `ssr: false`.

### Fonts

| Family | File | How |
|---|---|---|
| text class (`--font-cal-sans`, Tailwind `font-sans`) | `fonts/standin/CalSansVF-coss.woff2`, Cal Sans 2.001, 147 KB | PREVIEW STAND-IN only; does not move. Their site sets this variable itself. `next/font/local`, preloaded |
| demo class (`--font-cal-sans-demo`, Tailwind `font-demo`) | `fonts/CalSansVF-latin.woff2`, Cal Sans 2.011, 175 KB | `next/font/local`, weight `400 700`, normal and italic from the same file, preloaded |
| `--font-cal-sans-full` (Tailwind `font-glyphs`) | `fonts/CalSansVF-full.woff2`, 290 KB | `next/font/local`, not preloaded; the Glyphset section |
| `--font-paper-mono` (Tailwind `font-mono`) | `assets/PaperMono-Regular.woff2` | `next/font/local`, not preloaded |
| `"Cal Sans 2"` | same file as the demo class | literal `@font-face`, for the components |
| `"Cal Sans 2 Full"` | `CalSansVF-full.woff2` | literal |
| `"CalSansFlex_v2"` | `fonts/CalSansFlexVF-HOIGrid.woff2`, 14 KB | literal (HOIGrid); a subset, see `fonts/README.md` |
| `"Cal Anim Graph 6 [MORF,opsz]"`, `"… Variable Regular"` | `assets/CalAnimGraph6[MORF,opsz]VF.woff2` | literal (VariableMorph, VariableMorph2) |
| `"Paper Mono"`, `"Paper Mono Regular"` | `assets/PaperMono-Regular.woff2` | literal |

The components ask for their fonts by family names like `"Cal Sans 2"`, and `next/font`
names a family after its JavaScript variable, so those faces are plain `@font-face`
rules rendered into `<head>` by the layout (`LITERAL_FONT_FACES` in `src/fonts.ts`).
Their URLs are built exactly the way `next/font` builds its own, so `"Cal Sans 2"` and
the demo class are one URL and one 175 KB download.

### Two text classes

Cal.com's site already serves a Cal Sans (Version 2.001: opsz 8–32, GEOM, wght, YTAS, SHRP;
no `ital` axis, no cvXX or ssXX). The page uses it for running text and keeps the full
Cal Sans 2.011 for everything that demonstrates the font.

| Class | Variable | Tailwind | For |
|---|---|---|---|
| text (the default) | `--font-cal-sans` | `font-sans`, inherited from `<body>` | Words ABOUT the font: section headings and ledes, captions, labels, Info, the FAQ, the CTA copy |
| demo | `--font-cal-sans-demo` | `font-demo` | Anything that SHOWS the font's styles, and anything that needs `ital`, cvXX, ssXX, or opsz above 32 |

The rule: if it shows a style, it is demo; if it talks about the font, it is text. Elements
that name a family by string (`"Cal Sans 2"`, `"Cal Sans 2 Full"`, `"CalSansFlex_v2"`) are
demo already. Native elements opt in with `font-demo` (or `font-glyphs`, which is demo plus
the full-font face). A text element must never ask for `ital`, cvXX, or ssXX: their build
ignores them silently.

**The text stack.** `.page-content` in `globals.css` sets `"calSans"` first and 2.011 under it,
so a reader who comes straight to this page sees 2.011 until your file arrives, then the text
swaps to it. Your `--font-cal-sans` bundles `"calSans Fallback"` right after the font, so this
one rule names your family, `"calSans"`, directly. If you rename it, update that rule: until
then the text stays in 2.011.

**Nothing else needs repointing on the move.** The text class is `var(--font-cal-sans)`, which
their own `next/font` already puts on `<html>`, and no section or component names their
file (its URL is hashed per deploy). The demo class has its own variable name, so it can't
collide with theirs, and it works unchanged after the move. Carry over the `--font-demo`
line in `globals.css` (`@theme`, next to `--font-sans`) so the `font-demo` utility exists.

**One export does not move: the stand-in.** `calSans` in `src/fonts.ts` is a copy of their
2.001 file (`fonts/standin/CalSansVF-coss.woff2`), there only so the text class looks right
in this standalone app. Delete that export, its line in `fontVariables`, and
`fonts/standin/`. Keep `calSansDemo`, `calSansFull`, `paperMono`, and the literal faces.

Expect small differences in the text class: 2.001 is a few percent narrower or wider per
line than 2.011 (a handful of paragraphs rewrap by one line), and headings above 32px get
opsz 32, not up to 45.

## Breakpoints

Tailwind's defaults stay. These are added (`globals.css`, `--breakpoint-*`):

| Prefix | From | Framer band |
|---|---|---|
| (none) | 0 | ≤389, small phone |
| `bp390:` | 390px | 390–809, phone |
| `bp810:` | 810px | 810–1199, tablet |
| `bp1200:` | 1200px | 1200–1919, desktop |
| `bp1440:` | 1440px | your 1440 screen; no Framer band |
| `bp1920:` | 1920px | ≥1920, large desktop |

Mobile-first, as in all of Tailwind; `max-bp810:` means "below 810". Framer's bands don't
inherit from one another, so a value that differs per band is restated at each.

## The section slots

`app/font/page.tsx` renders `src/sections/01-hero.tsx` … `24-faq.tsx` in order. The space
between sections is one CSS rule on `.page-content` in `globals.css` (72px on phones, 96px
from 810, 128px from 1200; none above the first section, and none between 15 and 16 below
810, as on the live page). Each section file:

- keeps its file name and its default export;
- renders one root `<section id="<slug>" data-framer-name="<Framer layer name>">`, through
  `<Section id framerName>` from `Section.tsx` (`wide` for the `page-wide` sections, and
  `className` for what differs from the shared flex row). 03, 04, 20, and 24 write their
  own root: a fixed-height card, the sticky stack, a single card with no gap or clip, and
  Cal.com's own FAQ;
- doesn't render a divider (the page's CSS does the spacing);
- is a server component; Framer components come in through `src/framer/<Name>.tsx`.

`Section` adds no element of its own. `src/lib/Reveal.tsx` finds a section's fade-in blocks
by walking down single-child wrappers from the `<section>`, so the depth inside a section
must stay as it is.

### Text styles

Three classes in `globals.css` (`@layer components`), named by role, sit on top of the two
font classes. They are for text that talks about the font; specimens and demos state their
axes where they sit.

| Class | Is | Size |
|---|---|---|
| `text-subhead` | a block's heading: foreground, `"wght" 400, "GEOM" 50`, line-height 1.5 | 16px, 20px from 810 |
| `text-lede` | the copy under it: muted foreground, `"wght" 400, "GEOM" 25`, line-height 1.5 | 16px, 20px from 810 |
| `text-held` | with either: keeps 20px on phones, where the live page does for some headings and copy | 20px |

The axes are also `--fvs-subhead` and `--fvs-lede`, for the few places that need them
without the rest (an inline style, the axis-card labels). A one-off size goes on top as a
utility (`text-lede text-[18px]`); utilities beat the components layer.

### Breakpoint hook

`useBand(bands, fallback, server?)` in `src/lib/useBand.ts` is the one copy of the band logic
for the `src/framer/` wrappers. A wrapper lists its bands as `[label, media query]` pairs,
widest first (`framerBands()` gives Framer's 390 / 810 / 1200 / 1920 edges); labels are names
or indexes, whatever the wrapper indexes its per-band props with. `server` is the band the
server render and hydration assume. Leave it out for a `clientOnly` component, which never
renders on the server.

## Notes for Cal.com

On 2026-11-04, `next build` passed from a fresh clone (the `/font` route prerenders as
static, 193 kB first load). On 2026-11-03, the page rendered at 375, 390, 810, 1200, and
1920 in light and dark with no console errors, and no request left the host.

- **Breakpoint names.** Your staging CSS calls the same widths `tablet` (810) and
  `desktop` (1200). The `bp810:`/`bp1200:` prefixes here are the Framer bands under
  neutral names; rename them to yours in `globals.css` and the sections if you prefer.
- **Section 11 reads two SVGs at build time** (`src/sections/11-open-source-a.tsx`,
  `fs.readFileSync` from `public/font/11-open-source-a/`) and inlines them so their colors
  can follow the tokens. That works because the route prerenders; if `/font` ever becomes
  dynamic, move the two files to imports.
- **`/favicon.ico`** 404s in this standalone app. Your site has one.
- **The FAQ** is your own section, kept verbatim, except its "Ask anything else" input,
  which belongs to your site's form handling and was left out.
- **Scroll dimming (section 04).** On the Framer page the dimming never fires: its trigger
  needs a block exactly as tall as the viewport. The port does what it was meant to do: a
  block's text is at full opacity while it covers at least half the screen and fades to
  0.3 as it slides under the pinned word mark. `IN_VIEW = 1` in `src/framer/ScrollDim.tsx`
  restores the literal Framer behavior.
- **Body size inside components.** Framer's page body is 12px with `line-height: normal`;
  yours is 16px / 1.5. Components that inherit the body size (the dashboard in section 13)
  set the Framer values on their wrapper. If a component looks taller than on cal.com/font,
  that inheritance is the first thing to check.
- **Phone headings.** The 16px phone headings in sections 13, 14, and 15 are as the Framer
  page has them; only 18, 22, and 23 were raised to 20px (a bug fix).
- **Safari and Firefox.** The Flex subset in section 10 was checked in Safari 26.2
  against the full Flex file: the only differences are invisible, at most 8/255 on glyph
  edges. The rest of the page was verified only in Chrome (headless and desktop). In
  Safari, look first at the hero foil (AnimatedCal2, WebGL) and the full-font
  fall-through for glyphs outside the Latin subset. Firefox was not checked.
- **Texts in section 17.** The ten passages are the Framer page's. Most are public domain
  (Gropius, Dickens, the Bauhaus manifesto; Faulkner's 1929 opening entered the US public
  domain in 2025). The one still in copyright is the opening sentence of Pynchon's
  *Gravity's Rainbow* (1973), used twice, one sentence each time. Swap it if your counsel
  prefers.

- **The nav over the hero.** The page starts with the Hero at the very top, under your
  sticky floating nav (`sticky top-2`, h-16, max-w 1320), as on staging. Mark would
  rather the nav not draw its glassy translucent bar over the hero. That's your
  component, so it's not built here.
- **Cal Sans 2.011.** Kept as the demo class beside your own Cal Sans; nothing to replace.
  See Fonts, "Two text classes".
