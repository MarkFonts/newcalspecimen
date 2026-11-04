import path from "node:path"
import type { NextConfig } from "next"

// The Framer code components are in components/, as written for Framer. Three things make them
// build outside it:
//
//   1. `import … from "framer"`  → src/shims/framer.tsx (resolve.alias)
//   2. `import … from "https://framer.com/m/Shared-<id>.js@<hash>"` (and SharedTester-…)
//      → components/Shared.tsx / SharedTester.tsx
//   3. jsDelivr font URLs inside Shared.tsx and HOIGrid.tsx → local woff2 files
//   (2 and 3: config/framer-source-loader.cjs, a pre-loader on components/*.tsx)
//
// All three are webpack hooks, so the app must build with webpack: `next dev` and
// `next build` on Next 15 use it by default. Do NOT pass --turbopack.

const ROOT = __dirname
const COMPONENTS = path.resolve(ROOT, "components")

const nextConfig: NextConfig = {
    // No ESLint setup in the skeleton; the type check still runs.
    eslint: { ignoreDuringBuilds: true },

    webpack(config, { isServer, nextRuntime, dev }) {
        config.resolve.alias = {
            ...config.resolve.alias,
            framer$: path.join(ROOT, "src/shims/framer.tsx"),
            // @components/X → components/X.tsx. Set here, not in tsconfig paths, so the
            // type checker never opens the Framer sources (see types/components.d.ts).
            "@components": COMPONENTS,
        }

        const compilerType = !isServer ? "client" : nextRuntime === "edge" ? "edge-server" : "server"
        config.module.rules.unshift(
            {
                test: /\.tsx$/,
                include: [COMPONENTS],
                enforce: "pre",
                use: [{ loader: path.join(ROOT, "config/framer-source-loader.cjs") }],
            },
            {
                // Font files imported from JS/TS (not from CSS url(), which Next handles).
                test: /\.(woff2|woff|ttf|otf)$/,
                issuer: /\.[cm]?[jt]sx?$/,
                type: "javascript/auto",
                use: [
                    {
                        loader: path.join(ROOT, "config/font-url-loader.cjs"),
                        options: { compilerType, isDev: dev, assetPrefix: "" },
                    },
                ],
            }
        )
        return config
    },
}

export default nextConfig
