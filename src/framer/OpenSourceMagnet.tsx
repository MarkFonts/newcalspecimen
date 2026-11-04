"use client"

// Client boundary for components/OpenSourceMagnet.tsx (spec 11).
//
// Client-only: the component builds its letters in an effect, so the server could only
// send an empty row plus a reset icon that flashes and fades. The fallback reserves the
// component's height per band instead (letters row + refreshOffset + the 32px reset row).
//
// Per-band props, as the live page gives them (Mark's decisions in the spec):
//   fontSize       57 / 57 / 125 / 150 / 175
//   refreshOffset   0 /  0 /  10 /  20 /  20
//   cycleSpeed     0.06 everywhere (the published 0.28 at 1200–1919 was an accident)
//
// Two live bugs fixed from here, without touching the component:
//   - stickerColor is hex, so its `${color}40` shadow is valid CSS (#6358C440);
//   - the letters set no color, so the wrapper sets the foreground token for them.
import { clientOnly } from "@/lib/clientOnly"
import { framerBands, useBand } from "@/lib/useBand"
import Source from "@components/OpenSourceMagnet"

// Framer's bands: ≤389 · 390–809 · 810–1199 · 1200–1919 · ≥1920
type Band = 0 | 1 | 2 | 3 | 4 // 0 = ≤389 … 4 = ≥1920
const BANDS = framerBands<Band>({ large: 4, desktop: 3, tablet: 2, phone: 1 })

const FONT_SIZE = [57, 57, 125, 150, 175]
const REFRESH_OFFSET = [0, 0, 10, 20, 20]

function Fallback() {
    // fontSize + refreshOffset + 32: 89 / 89 / 167 / 202 / 227
    return <div aria-hidden className="h-[89px] bp810:h-[167px] bp1200:h-[202px] bp1920:h-[227px]" />
}

function Magnet() {
    const band = useBand(BANDS, 0)
    return (
        <div className="text-foreground">
            <Source
                defaultContent="Open Source"
                font="full"
                fontSize={FONT_SIZE[band]}
                weight={700}
                geom={25}
                opsz={36}
                cycleSpeed={0.06}
                refreshColor="var(--foreground)"
                refreshOffset={REFRESH_OFFSET[band]}
                stickerColor="#6358C4"
                stickerScale={50}
                debug={false}
            />
        </div>
    )
}

// Magnet reads matchMedia during render and the letters only exist after mount, so the
// whole thing is client-only; the server sends the fallback.
export const OpenSourceMagnet = clientOnly(() => Promise.resolve({ default: Magnet }), Fallback)
