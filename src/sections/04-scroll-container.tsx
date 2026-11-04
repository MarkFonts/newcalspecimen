// 04 · scroll-container
// Built from: CalGraphics + native sticky layers
//
// The animated "Cal Graphics" word-mark is pinned to the screen (position: sticky) while
// three statements scroll past under it. Blocks 1 and 2 dim to 0.3 when they leave the
// screen (src/framer/ScrollDim.tsx, which explains the trigger). Round 2: Framer's 400vh
// stack ended with a full empty screen around the last line; the pin now lets go with
// that line right under the mark.
//
// Sticky needs every ancestor up to the page to keep overflow visible or clip (never
// hidden or auto) and untransformed. Nothing here breaks that.
import { CalGraphicsByBand } from "@/framer/CalGraphics"
import { ScrollDim } from "@/framer/ScrollDim"
import styles from "./04-scroll-container.module.css"

// Framer's base (≥1920) and per-band overrides (lub0p8qOM 1200–1919, B1X1poNuE 810–1199,
// Ua6cntmFh 390–809, NMkprdVDQ ≤389).
const BASE = { fontSize: 140, badgeOnTop: false, debug: false }
const BANDS = {
    "1200": { fontSize: 110 },
    // Round 2: 65 → 88 at 810–1199, where the mark sat no bigger than the 62px lines, and as
    // wide as the column allows at 810. Phones 65 → 58, for the same reason at 390.
    "810": { fontSize: 88 },
    "390": { fontSize: 58, badgeOnTop: true },
    "389": { fontSize: 58, badgeOnTop: true },
}

const BLOCKS = [
    { heading: "One typographic voice", sub: "from banner to button." },
    { heading: "Drops in clean.", sub: "Just warmer." },
    { heading: "Geometry and flow,", sub: "balanced automatically." },
]

// The text. Round 2 sets it on Cal.com's quote sizes, not their section-title sizes: 26px on
// phones, 32px at 810–1199, and 40px from 1200, where round 1 had Framer's 28 / 62 / 70px.
// Heading and subline differ only in color ("wght" 350 renders as 400, the font's minimum;
// MODE is not an axis).
const LINE =
    "relative w-full flex-none text-left text-[26px] leading-[1.05] whitespace-pre-wrap break-words [font-variation-settings:var(--fvs-lede)] bp810:text-[32px] bp1200:text-[40px]"
const INNER = "relative z-[1] flex w-full max-w-[800px] flex-col items-center justify-center gap-2.5 pt-[200px]"

function Lines({ heading, sub }: { heading: string; sub: string }) {
    return (
        <>
            <h2 className={`${LINE} z-[1] text-foreground`}>{heading}</h2>
            <p className={`${LINE} z-[1] text-muted-foreground`}>{sub}</p>
        </>
    )
}

export default function ScrollContainer() {
    return (
        <section
            id="scroll-container"
            data-framer-name="scroll-container"
            className="page-measure section-y flex flex-col items-center gap-2.5 overflow-visible bp810:z-[2] bp1200:z-auto"
        >
            {/* The pinned word-mark, then the lines. The pin is only as tall as the mark plus the
                last line (--pin in the module CSS), so it lets go with that line sitting right
                under the mark, and the next section follows after the normal section gap. */}
            <div className={`relative flex w-full flex-none flex-col items-center overflow-visible bg-background ${styles.stack}`}>
                <div className={`sticky top-0 z-[8] flex w-full flex-none flex-col items-center overflow-visible ${styles.pin}`}>
                    <div className={`relative h-auto w-auto flex-none ${styles.graphic}`}>
                        <CalGraphicsByBand base={BASE} bands={BANDS} />
                    </div>
                </div>
                {/* Blocks 1 and 2: dim when off screen */}
                {BLOCKS.slice(0, 2).map((b) => (
                    <div
                        key={b.heading}
                        className="relative z-[1] flex h-screen w-full flex-none flex-col items-center justify-center gap-2.5 overflow-visible"
                    >
                        <ScrollDim className={INNER}>
                            <Lines {...b} />
                        </ScrollDim>
                    </div>
                ))}
                {/* Block 3: its line keeps the 100vh spacing from block 2, and ends the column. */}
                <div className={`relative z-[1] flex w-full flex-none flex-col items-center justify-end overflow-visible ${styles.last}`}>
                    <div className="flex w-full max-w-[800px] flex-col items-center justify-center gap-2.5">
                        <Lines {...BLOCKS[2]} />
                    </div>
                </div>
            </div>
        </section>
    )
}
