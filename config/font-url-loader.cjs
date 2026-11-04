// Turns `import url from "…/Font.woff2"` into the font's public URL, for @font-face rules
// that must carry a literal family name ("Cal Sans 2", "CalSansFlex_v2", …), which
// next/font/local can't do: it hashes every family name.
//
// The file name is built exactly the way next/font/local builds its own
// (next/dist/build/webpack/loaders/next-font-loader: `static/media/[hash]-s[.p].ext`, same
// hash function, same content), so a literal face and a next/font face of the same file
// share one URL and the browser downloads the file once. Add `?preload` to the import when
// the matching next/font call preloads (the default); leave it off when it sets
// preload: false. Emitting mirrors next-image-loader, so the file lands in
// .next/static/media whichever compiler (client, server, edge) sees the import first.
const path = require("node:path")
const loaderUtils = require("next/dist/compiled/loader-utils3")

module.exports = function fontUrlLoader(content) {
    const { compilerType, isDev, assetPrefix = "" } = this.getOptions()
    const ext = path.extname(this.resourcePath).slice(1)
    const preload = /(^|[?&])preload\b/.test(this.resourceQuery || "")
    const name = loaderUtils.interpolateName(
        this,
        `static/media/[hash]-s${preload ? ".p" : ""}.${ext}`,
        { context: this.rootContext, content }
    )
    if (compilerType === "client") {
        this.emitFile(name, content, null)
    } else {
        this.emitFile(
            path.join("..", isDev || compilerType === "edge-server" ? "" : "..", name),
            content,
            null
        )
    }
    return `export default ${JSON.stringify(`${assetPrefix}/_next/${name}`)};`
}
module.exports.raw = true
