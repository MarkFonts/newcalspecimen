// Pre-loader for the Framer component sources in components/ (this rewrites
// the code webpack sees, never the files on disk). It does two jobs.
//
// 1. Framer imports shared code by URL: "https://framer.com/m/Shared-<id>.js@<hash>" and
//    "https://framer.com/m/SharedTester-<id>.js@<hash>". The @<hash> is a version pin that
//    differs per component, so both are matched by prefix and pointed at the local files.
//    (A NormalModuleReplacementPlugin can't do this: webpack's web target externalizes
//    https:// requests before the replacement takes effect, so it's done in source here,
//    the same way sandbox/vite.config.ts does it.)
//
// 2. The components fetch their fonts from jsDelivr at runtime: Shared.tsx's CAL_SANS points
// at the 1.19 MB CalSansVF.ttf, and HOIGrid's FLEX at CalSansFlexVF.ttf. Each URL below is
// swapped for a local woff2, imported through font-url-loader so it gets the same
// /_next/static/media URL that next/font gives the same file (one download, not two).
//
// The coss ui URLs in Shared.tsx (CAL_SANS_COSS) are left alone on purpose: the port
// renders everything in Cal Sans 2.011, so no instance may pass font: "coss" without a
// cossRoman file. If one does, the network check will show a jsDelivr request.
const path = require("node:path")

const FONTS = path.resolve(__dirname, "../fonts")
const COMPONENTS = path.resolve(__dirname, "../components")

const URL_IMPORTS = [
    [/"https:\/\/framer\.com\/m\/SharedTester-[^"]+"/g, path.join(COMPONENTS, "SharedTester.tsx")],
    [/"https:\/\/framer\.com\/m\/Shared-[^"]+"/g, path.join(COMPONENTS, "Shared.tsx")],
]

const REWRITES = [
    {
        // Shared.tsx → CAL_SANS.url, family "Cal Sans 2"
        find: /`\$\{JSD\}\/calsans-var-full\/CalSansVF\.ttf`/,
        file: path.join(FONTS, "CalSansVF-latin.woff2"),
        query: "?preload", // matches the page font's next/font call (preload: true)
    },
    {
        // HOIGrid.tsx → FLEX.url, family "CalSansFlex_v2"
        find: /"https:\/\/cdn\.jsdelivr\.net\/gh\/calcom\/sans@main\/fonts\/calsans-var-flex\/CalSansFlexVF\.ttf[^"]*"/,
        file: path.join(FONTS, "CalSansFlexVF-HOIGrid.woff2"),
        query: "",
    },
]

module.exports = function framerSourceLoader(source) {
    let out = source
    for (const [find, file] of URL_IMPORTS) out = out.replace(find, JSON.stringify(file))
    const imports = []
    REWRITES.forEach((r, i) => {
        if (!r.find.test(out)) return
        const name = `__localFontUrl${i}`
        imports.push(`import ${name} from ${JSON.stringify(r.file + r.query)};`)
        out = out.replace(r.find, name)
    })
    return imports.length ? imports.join("\n") + "\n" + out : out
}
