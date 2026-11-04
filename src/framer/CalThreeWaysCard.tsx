"use client"

// Client boundary for components/CalThreeWaysCard.tsx (spec 12): the animated specimen
// in each of the three ways. The rows around it are in src/framer/ThreeWaysTabs.tsx.
//
// Per band, sized for the half-width stage (round 2; Framer's were 290 / 290 / 700 / 1020 / 970
// wide at 32 / 32 / 71 / 90 / 90 pt with controls at 75 / 75 / 100 / 100 / 100 %):
//   boxWidth       290 / 290 / 300 /  430 / 470 px
//   fontSize        32 /  32 /  42 /   64 /  64 pt (the component draws it at ÷ 0.75 px)
//   controlScale    75 /  75 /  65 /  100 / 100 %
// controlScale resizes every number of the mini control in JS, so the props must be
// right on first render: the component is client-only, and the server sends a box of
// the same size (word line + gap + control band) so nothing shifts when it mounts.
//
// It runs off one global clock (performance.now()), so the three cards stay in lockstep.
// prefers-reduced-motion: MotionConfig isStatic stops its frame loop; the card shows its
// first frame and holds it.
//
// React 19 ignores defaultProps on function components, so they are spread in here.
import { useEffect, useState } from "react"
import { MotionConfig } from "framer-motion"
import { clientOnly } from "@/lib/clientOnly"
import { framerBands, useBand } from "@/lib/useBand"
import Source from "@components/CalThreeWaysCard"

// Framer's bands: ≤389 · 390–809 · 810–1199 · 1200–1919 · ≥1920
type Band = 0 | 1 | 2 | 3 | 4 // 0 = ≤389 … 4 = ≥1920
const BANDS = framerBands<Band>({ large: 4, desktop: 3, tablet: 2, phone: 1 })
const REDUCE = "(prefers-reduced-motion: reduce)"
function useReducedMotionNow() {
    const [reduce, setReduce] = useState(() => matchMedia(REDUCE).matches)
    useEffect(() => {
        const mq = matchMedia(REDUCE)
        const on = () => setReduce(mq.matches)
        mq.addEventListener("change", on)
        return () => mq.removeEventListener("change", on)
    }, [])
    return reduce
}

const BOX_WIDTH = [290, 290, 300, 430, 470]
const DISPLAY_SIZE = [32, 32, 42, 64, 64]
const CONTROL_SCALE = [75, 75, 65, 100, 100]
// The band sizes are maxima. A band spans a range of stage widths, and the word is wider at the
// wide end, so Card fits it to the measured stage: PAD px clear on each side of the widest word.
// WIDEST_WORD_EM is that word's width in em (Counter form, measured at 6.28 across every band, rounded up).
const PAD = 24
const WIDEST_WORD_EM = 6.29

export type Way = "geom" | "features" | "recal"

function Card({ way, stageWidth }: { way: Way; stageWidth: number }) {
    const band = useBand(BANDS, 0)
    const reduce = useReducedMotionNow()
    const defaults = (Source as { defaultProps?: object }).defaultProps ?? {}
    // stageWidth is 0 until the stage is measured; then the band values stand.
    const fontSize = stageWidth > 0 ? Math.min(DISPLAY_SIZE[band], ((stageWidth - 2 * PAD) / WIDEST_WORD_EM) * 0.75) : DISPLAY_SIZE[band]
    const boxWidth = stageWidth > 0 ? Math.min(BOX_WIDTH[band], stageWidth - 2 * PAD) : BOX_WIDTH[band]
    return (
        // key: isStatic must not change under mounted motion components, so remount.
        <MotionConfig isStatic={reduce} key={reduce ? "static" : "live"}>
            <Source
                {...defaults}
                way={way}
                text="Geometry"
                fontSize={fontSize}
                boxWidth={boxWidth}
                controlScale={CONTROL_SCALE[band]}
                color="var(--foreground)"
                debug={false}
            />
        </MotionConfig>
    )
}

// The server's stand-in: the component's own box per band, so the card keeps its height.
//   height = word line (pt ÷ 0.75 × 1.2) + gap (22 × scale) + control band (96 × scale)
function Fallback() {
    return (
        <div
            aria-hidden
            className="h-[139.7px] w-[290px] bp810:h-[143.9px] bp810:w-[300px] bp1200:h-[220.4px] bp1200:w-[430px] bp1920:w-[470px]"
        />
    )
}

export const CalThreeWaysCard = clientOnly<{ way: Way; stageWidth: number }>(() => Promise.resolve({ default: Card }), Fallback)
