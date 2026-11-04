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

## Cal Sans Flex

`CalSansFlexVF-HOIGrid.woff2` (14 KB) is a subset of Cal Sans Flex 2.011 made by calbuild for
HOIGrid in section 10, and it is only valid at that grid's settings: the glyphs I, t, f, y, j, M,
C, and 9, at `opsz` 10, `wght` 400, `YTAS` 1440, `SHRP` 0, `ital` 0, across the GEOM bands I 5–10,
C and M 75–80, and t, f, y, j, and 9 35–40 and 75–80. Anywhere else it renders wrong, even though
its `fvar` still lists the wider `opsz` range. Changing a glyph, a band, `opticalSize`, or `weight`
in that section needs a rebuild: `calbuild/experiments/hoigrid-subset/build_hoigrid.py`.
