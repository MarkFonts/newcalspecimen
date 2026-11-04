"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { useBand, type BandQuery } from "@/lib/useBand"
import CalSansSpecimenCardSource from "@components/CalSansSpecimenCard"

// Client boundary for components/CalSansSpecimenCard.tsx (section 16, Waterfall sample).
//
// Framer gave each card its props per breakpoint; here a matchMedia hook does it:
//   below 810     mobile: true, headerGap 2
//   810–1199      headerGap 5 for the cards that ask for it (lines 1 and 5), else 8
//   from 1200     headerGap 8
//
// The card fits its line to its own width only once it's in the browser; its server HTML
// is the line at 100px, unscaled, far wider than the card. So the card stays invisible
// until it has fitted (fonts loaded, then two frames), and until then the section's CSS
// holds its box at the height the fit will give (16-waterfall-sample.module.css, from
// `natural`, the line's width at 100px).

const PHONE = "(max-width: 809.98px)"
const TABLET = "(min-width: 810px) and (max-width: 1199.98px)"
type Band = "phone" | "tablet" | "desktop"
const BANDS: BandQuery<Band>[] = [
    ["phone", PHONE],
    ["tablet", TABLET],
]

type Props = {
    defaultContent: string
    weight: number
    geom: number
    /** headerGap at 810–1199 (Framer: 5 for lines 1 and 5, otherwise the base 8). */
    tabletHeaderGap?: number
    /** Natural width of `defaultContent` at 100px, for the pre-fit box height. */
    natural: number
    className?: string
    cardClassName?: string
}

export function CalSansSpecimenCard({ natural, tabletHeaderGap = 8, className = "", cardClassName = "", ...props }: Props) {
    const band = useBand(BANDS, "desktop", "desktop")
    const [ready, setReady] = useState(false)
    useEffect(() => {
        let alive = true
        const settle = () => requestAnimationFrame(() => requestAnimationFrame(() => alive && setReady(true)))
        if (document.fonts?.ready) document.fonts.ready.then(settle)
        else settle()
        return () => {
            alive = false
        }
    }, [])

    const headerGap = band === "phone" ? 2 : band === "tablet" ? tabletHeaderGap : 8
    return (
        <div
            className={`${cardClassName} ${className}`}
            data-ready={ready ? "" : undefined}
            data-tablet-gap={tabletHeaderGap}
            style={{ "--natural": natural } as CSSProperties}
        >
            <CalSansSpecimenCardSource
                {...props}
                font="full"
                opsz={45}
                showGeomToggle
                // The arrow's fill; the wrapper's color is the muted-foreground token.
                refreshColor="currentColor"
                debug={false}
                mobile={band === "phone"}
                headerGap={headerGap}
            />
        </div>
    )
}
