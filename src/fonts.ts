import localFont from "next/font/local"

// Font files imported as URLs (config/font-url-loader.cjs), for the literal faces below.
// `?preload` must match the next/font call for the same file (preload: true), so both
// resolve to the same /_next/static/media URL. The others carry no query because their
// next/font twin sets preload: false, or they have none.
import calSansLatinUrl from "../fonts/CalSansVF-latin.woff2?preload"
import calSansFullUrl from "../fonts/CalSansVF-full.woff2"
import calSansFlexUrl from "../fonts/CalSansFlexVF.woff2"
import animGraphUrl from "../assets/CalAnimGraph6[MORF,opsz]VF.woff2"
import paperMonoUrl from "../assets/PaperMono-Regular.woff2"

// Every font on the page, self-hosted. No CDN: nothing loads from jsDelivr or framer.com.
//
// Two mechanisms, because the page has two kinds of consumer:
//
//   next/font/local  for native text (Cal.com's convention). It hashes the family name,
//                    so it's reached only through the CSS variables below, which
//                    globals.css maps to Tailwind's font-sans / font-demo / font-mono.
//   literal faces    for the Framer components, which ask for families BY NAME
//                    ("Cal Sans 2", "CalSansFlex_v2", …). Those @font-face rules are in
//                    LITERAL_FONT_FACES below and render in <head> from app/layout.tsx.
//
// Where both point at the same file they share one URL (see config/font-url-loader.cjs),
// so the browser downloads it once.
//
// Two text classes (README, "Two text classes"):
//
//   text   var(--font-cal-sans)       Tailwind font-sans, what <body> inherits. Words ABOUT the
//                                     font: headings, ledes, captions, labels, FAQ. In Cal.com's
//                                     site this variable is already theirs, so these resolve to
//                                     the Cal Sans they serve. Nothing in a section or a
//                                     component may name that file.
//   demo   var(--font-cal-sans-demo)  Tailwind font-demo. Anything that SHOWS the font's styles,
//                                     and anything that needs `ital`, cvXX, ssXX, or opsz above
//                                     32. This is the port's own Cal Sans 2.011, under its own
//                                     variable name, so it can't collide with theirs.

// ── next/font/local ──────────────────────────────────────────────────────────────────

// PREVIEW STAND-IN. This is the ONLY export that does not move to Cal.com's repo.
// It stands in for the Cal Sans their site already serves, so the text class looks right in
// this standalone app: Version 2.001 (opsz 8–32, GEOM, wght, YTAS, SHRP; no `ital`, no cvXX
// or ssXX), a copy of their file. On their site `--font-cal-sans` is set on <html> by their
// own next/font, so delete this export, its entry in `fontVariables`, and
// fonts/standin/. Nothing else references the file. Normal style only, because the file has
// no `ital` axis: text that needs italic belongs to the demo class.
export const calSans = localFont({
    src: [{ path: "../fonts/standin/CalSansVF-coss.woff2", weight: "400 700", style: "normal" }],
    variable: "--font-cal-sans",
    display: "swap",
})

// DEMO CLASS. Cal Sans 2.011, Latin subset, every axis and layout feature (opsz 8–45, GEOM,
// wght, YTAS, SHRP, ital). Declared as normal AND italic from the same file so the browser
// italicizes through the `ital` axis and never synthesizes a slant. Preloaded; the literal
// "Cal Sans 2" face below shares its URL (hence `?preload` on the import above).
export const calSansDemo = localFont({
    src: [
        { path: "../fonts/CalSansVF-latin.woff2", weight: "400 700", style: "normal" },
        { path: "../fonts/CalSansVF-latin.woff2", weight: "400 700", style: "italic" },
    ],
    variable: "--font-cal-sans-demo",
    display: "swap",
})

// The whole font (1,000+ glyphs), for the Glyphset section. Not preloaded.
export const calSansFull = localFont({
    src: [
        { path: "../fonts/CalSansVF-full.woff2", weight: "400 700", style: "normal" },
        { path: "../fonts/CalSansVF-full.woff2", weight: "400 700", style: "italic" },
    ],
    variable: "--font-cal-sans-full",
    display: "swap",
    preload: false,
})

// Paper Mono, for code runs in native text (sections 07 and 23). Not preloaded.
export const paperMono = localFont({
    src: "../assets/PaperMono-Regular.woff2",
    weight: "400",
    style: "normal",
    variable: "--font-paper-mono",
    display: "swap",
    preload: false,
})

/** Put on <html>: defines --font-cal-sans-demo, --font-cal-sans-full, and --font-paper-mono,
 *  plus the stand-in --font-cal-sans (first entry: drop it on the move). */
export const fontVariables = [
    calSans.variable, // PREVIEW STAND-IN: Cal.com's site sets --font-cal-sans itself. Drop this line.
    calSansDemo.variable,
    calSansFull.variable,
    paperMono.variable,
].join(" ")

// ── literal family names ─────────────────────────────────────────────────────────────

/** Public URL of the full Cal Sans 2.011, for a component's cossRoman/cossItalic props. */
export const CAL_SANS_FULL_URL = calSansFullUrl

// Every code point the full font has and the Latin subset doesn't (377 of them: Vietnamese,
// more accents, arrows, math, currency, shapes, …). Regenerate if either file changes:
//   python3 -c "from fontTools.ttLib import TTFont as T; print(sorted(set(T('fonts/CalSansVF-full.woff2').getBestCmap()) - set(T('fonts/CalSansVF-latin.woff2').getBestCmap())))"
const FULL_ONLY_RANGE =
    "U+018F,U+0191-0192,U+01A0-01A1,U+01AF-01B0,U+01CD-01CE,U+01D3-01DC,U+01E2-01E3,U+01E6-01E9,U+01FE-01FF,U+0202-0203,U+0206-0207,U+020A-020B,U+020E-020F,U+0212-0213,U+0216-021B,U+021E-021F,U+0228-0229,U+0237,U+0259,U+02B9,U+02BB-02BC,U+02C6-02C8,U+02D8-02DD,U+0300-0304,U+0306-030C,U+030F,U+0311-0312,U+031B,U+0323-0324,U+0326-0328,U+032E,U+0331,U+0338,U+039B,U+039E,U+03A9,U+03BB,U+03BE,U+03C0,U+0E3F,U+1E0C-1E0D,U+1E20-1E21,U+1E24-1E25,U+1E2A-1E2B,U+1E34-1E3B,U+1E40-1E49,U+1E5C-1E5F,U+1E62-1E63,U+1E6C-1E6F,U+1E80-1E85,U+1E8E-1E8F,U+1E92-1E96,U+1E9E,U+1EA0-1EF9,U+2002-200D,U+2028-2029,U+202F,U+203C-203D,U+2044,U+2070,U+2074-2079,U+2080-2089,U+20A1,U+20A6,U+20A8-20AE,U+20B1-20B2,U+20B4-20B5,U+20B8-20BA,U+20BC-20BF,U+20C1,U+2113,U+2116,U+2126,U+212E,U+2153-2154,U+215B-215E,U+2194-2199,U+2202,U+2205-2206,U+220F,U+2211-2212,U+2215,U+221A,U+221E,U+222B,U+2234-2235,U+2248,U+2260,U+2264-2265,U+235F,U+24B9,U+25A0-25A1,U+25AA-25AB,U+25B2-25B9,U+25BC-25C3,U+25C6-25C7,U+25CA-25CC,U+25CF,U+25E6,U+25FC,U+2605-2606,U+2611-2612,U+2661,U+2665,U+266A-266B,U+2713-2714,U+2717-2718,U+2726-2728,U+2764,U+27E8-27E9,U+2B51-2B52,U+2E18,U+A78B-A78C,U+FB01-FB02,U+1F582"

function face(family: string, url: string, weight: string, style: string, range?: string) {
    return `@font-face{font-family:"${family}";src:url("${url}") format("woff2");font-weight:${weight};font-style:${style};font-display:swap${range ? `;unicode-range:${range}` : ""}}`
}
const both = (family: string, url: string, range?: string) =>
    face(family, url, "400 700", "normal", range) + "\n" + face(family, url, "400 700", "italic", range)

export const LITERAL_FONT_FACES = [
    // Framer's name for Cal Sans. Two faces, one family: the Latin subset for everything,
    // and the full font for only the code points the subset lacks, declared FIRST so it's
    // the fallback. The components inject their own "Cal Sans 2" face at runtime (rewritten
    // to the Latin URL by config/framer-source-loader.cjs); it claims every code point, and
    // Chrome falls through to the full face for the glyphs it lacks (GlyphPicker's whole
    // set, section 21). The full file only downloads when such a glyph is on screen.
    // Verify the fall-through in Safari when section 21 lands.
    both("Cal Sans 2", calSansFullUrl, FULL_ONLY_RANGE),
    both("Cal Sans 2", calSansLatinUrl),
    // The whole font under a literal name, for components that take a family string.
    both("Cal Sans 2 Full", calSansFullUrl),
    // HOIGrid (section 10). The Flex build has wght 400–700 too.
    both("CalSansFlex_v2", calSansFlexUrl),
    // VariableMorph and VariableMorph2 (sections 06, 07) ask for the "… Variable Regular"
    // name Framer gave it; the short name is what the brief and specs use.
    face("Cal Anim Graph 6 [MORF,opsz] Variable Regular", animGraphUrl, "400", "normal"),
    face("Cal Anim Graph 6 [MORF,opsz]", animGraphUrl, "400", "normal"),
    // Framer's preset names for Paper Mono (specs 07 and 23).
    face("Paper Mono Regular", paperMonoUrl, "400", "normal"),
    face("Paper Mono", paperMonoUrl, "400", "normal"),
].join("\n")
