// 01 · Hero
// Built from: AnimatedCal2 (WebGL: clientOnly)
//
// "Cal Sans" set huge, driven by the pointer, with the holographic v2.000 sticker and
// the hint sticker popping in at 4 s and 6 s. The component is the repo's
// components/AnimatedCal2.tsx, used as is (settled work: the foil is never simplified).
//
// The Hero starts at the very top of the page; Cal.com's sticky nav floats over it.
// Height is the component container's: 95vh at ≥1200, 80vh at 810–1199, 70vh below.
import { AnimatedCal2ByBand } from "@/framer/AnimatedCal2"
import styles from "./01-hero.module.css"
import { Section } from "./Section"

// The live instance's props (≥1920 and 1200–1919 share them), spec "Base instance".
// The foil preset `softFlood` decides the whole foil look, so the individual foil*/star*
// numbers (all equal to the defaults) are left to the component.
const BASE = {
    lines: "1",
    textColor: "var(--foreground)",
    labelColor: "var(--muted-foreground)",
    borderColor: "var(--border)",
    showLeftBorder: false, // round 2: no side bars (Mark, 2026-11-03)
    showRightBorder: false,
    cursorType: "crosshair",
    geomRange: "0-50",
    idleGeom: 25,
    debug: false,
    stickerText: "",
    // Hex, not Framer's rgb(99, 88, 196): the hint's shadow appends a hex alpha
    // (`${color}40`), which is invalid CSS after rgb(), so the live sticker has no shadow.
    stickerColor: "#6358C4",
    stickerScale: 60,
    stickerText2: "v2.000",
    stickerColor2: "#242424",
    stickerOutlineColor2: "#FFFFFF",
    stickerOutlineW2: 11,
    stickerScale2: 110,
    stickerX2: 86,
    stickerY2: 30,
    stickerHolo: "webgl",
    stickerFoil: "stars",
    stickerFoilImage: "/font/01-hero/illusion.png",
    foilPreset: "softFlood",
    foilBase: "#5a5a63",
}

// Framer's per-breakpoint overrides (B1X1poNuE 810–1199, Ua6cntmFh 390–809, NMkprdVDQ ≤389).
const PHONE = { lines: "2", stickerX2: 76, stickerY2: 50, stickerScale2: 150, stickerOutlineW2: 10, stickerScale: 45 }
const BANDS = {
    "810": { stickerX2: 70, stickerScale2: 160, stickerOutlineW2: 10 },
    "390": PHONE,
    "389": PHONE,
}

export default function Hero() {
    return (
        <Section
            id="hero"
            framerName="Hero"
            wide
            className="bp1200:max-w-[1806px] bp1200:px-1.5 bp1920:max-w-[1801px] bp1920:px-3 overflow-visible"
        >
            {/* Dark mode's sticker film (01-hero.module.css): a white tint plus frozen grain. */}
            <svg aria-hidden width="0" height="0" className="absolute">
                <defs>
                    <pattern id="hero-film" patternUnits="userSpaceOnUse" width="256" height="256">
                        <rect width="256" height="256" fill="#fff" fillOpacity={0.02} />
                        <image href="/font/01-hero/matte-grain.png" width="256" height="256" />
                    </pattern>
                </defs>
            </svg>
            <div className="relative flex w-px flex-[1_0_0] items-center justify-center gap-2.5 overflow-clip bp1200:px-1.5 bp1920:px-0">
                <div
                    className={`relative h-[70vh] w-px flex-[1_0_0] bp810:h-[80vh] bp1200:h-[95vh] ${styles.stage}`}
                >
                    <AnimatedCal2ByBand base={BASE} bands={BANDS} />
                </div>
            </div>
        </Section>
    )
}
