// A file in public/, under the base path when this app is built for GitHub Pages. The base path
// is empty everywhere else, including on Cal.com's site.
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`
