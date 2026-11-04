"use client"

// Client boundary for components/StickerCode.tsx (default export StickerCard).
//
// The pattern for every Framer component on the page: one file here per component,
// "use client", importing the source from ../components through @components/*. The
// section files (server components) import from here and pass the props from their spec.
// StickerCode is SSR-safe (browser APIs only inside effects), so it renders on the server
// too; components that aren't use clientOnly() from @/lib/clientOnly instead.
//
// StickerCodeByBand picks Framer's per-breakpoint prop set (sticker views: totalCount and
// fontSize change at 810 and 1200) with the same band edges as Framer.
import { useEffect, useState } from "react"
import { framerBands, useBand } from "@/lib/useBand"
import StickerCard from "@components/StickerCode"

export { StickerCard as StickerCode }

// React 19 ignores defaultProps on function components; spread the component's own.
const DEFAULTS = (StickerCard as unknown as { defaultProps?: Record<string, unknown> }).defaultProps ?? {}

// ── Framer's breakpoint bands ────────────────────────────────────────────────────────
type Band = "389" | "390" | "810" | "1200" | "1920"
const BANDS = framerBands<Band>({ large: "1920", desktop: "1200", tablet: "810", phone: "390" })

type Props = Record<string, unknown>

/** `base` is the ≥1920 prop set; `bands` holds each band's overrides (Framer's `overrides`). */
export function StickerCodeByBand({ base, bands }: { base: Props; bands: Partial<Record<Band, Props>> }) {
    const band = useBand(BANDS, "389", "1920")
    // A fresh mount per band: a band change swaps totalCount and fontSize.
    return <Measured key={band} props={{ ...DEFAULTS, ...base, ...bands[band] }} />
}

// StickerCard keys every sticker by its id AND the card's measured width, and the width is
// 0 on the first render (its ResizeObserver hasn't fired yet). So the first set of
// stickers always unmounts a frame later and a second set mounts. If the first set has
// already come into view by then, its whileInView spring (delayed up to `duration`) is
// still pending on an element that is gone, and framer-motion 11 under React 19 throws
// on it ("Cannot read properties of null (reading '0')" in mixObject, an `x` animation
// with keyframes [null, "-50%"]), which takes the page tree down.
//
// Fix, outside the component: hold the card off screen (a transform: invisible to the
// IntersectionObserver behind whileInView, ignored by the ResizeObserver) for the first
// two frames, so only the measured set of stickers ever starts its reveal.
function Measured({ props }: { props: Props }) {
    const [ready, setReady] = useState(false)
    useEffect(() => {
        let r2 = 0
        const r1 = requestAnimationFrame(() => {
            r2 = requestAnimationFrame(() => setReady(true))
        })
        return () => {
            cancelAnimationFrame(r1)
            cancelAnimationFrame(r2)
        }
    }, [])
    return (
        <div style={{ width: "100%", height: "100%", transform: ready ? undefined : "translateX(-300vw)" }}>
            <StickerCard {...props} />
        </div>
    )
}
