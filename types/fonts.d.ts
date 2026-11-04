// Font files imported from TS resolve to their public URL (config/font-url-loader.cjs).
declare module "*.woff2" {
    const url: string
    export default url
}
declare module "*.woff2?preload" {
    const url: string
    export default url
}
