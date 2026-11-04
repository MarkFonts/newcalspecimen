# Fonts for the port

Both are Cal Sans **2.011** (calcom/sans `fonts/calsans-var-full/CalSansVF.ttf`, built by calbuild),
converted to woff2 with every axis (opsz 8–45, GEOM, wght, YTAS, SHRP, ital) and every
layout feature kept. The GEOM `rclt` swaps and the stylistic sets need `--layout-features='*'`.

| file | what | size |
|---|---|---|
| `CalSansVF-latin.woff2` | Latin subset: U+0020–007E, U+00A0–017F, U+2010–2027, U+2030–203A, U+2122, U+2190–2193 | 175 KB |
| `CalSansVF-full.woff2` | the whole font, for the Glyphset section (1,000+ glyphs) | 290 KB |

Load with `next/font/local`, `font-weight: 400 700`, `font-style: normal` AND `italic`
pointing at the same file (the `ital` axis is in the file; never let the browser synthesize
a slant). Components pin `opsz`, so set `font-optical-sizing: none` where they do.
Cal.com staging ships 2.001 (opsz ≤ 32, no `ital`, no cvXX or ssXX). These do NOT replace it:
they are the demo class (`font-demo`), beside it. See "Two text classes" in the main README.

`standin/CalSansVF-coss.woff2` (147 KB, SIL OFL) is a copy of the 2.001 file their site serves,
bundled only so the text class looks right in this standalone app. It does not move over.
