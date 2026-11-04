// 03 · sticker views
// Built from: StickerCode
//
// A lime panel scattered with "Bouncy / Adaptable / Unassuming" stickers that spring in
// over 6 s when it scrolls into view, under the headline. Three roles re-theme the whole
// card, as in Mark's README export :
//   accent  the card and the sticker text, one color: lime #d0e26f, deep green #007e00 in dark
//   paper   the sticker plate: #f4f4f4, the --card plate in dark
//   ink     the headline: #242424, white in dark (it sits on the plates, not on the page)
// The accent and paper live in the module CSS as --sv-accent and --sv-paper.
//
// No 12px shell here: the section is the column itself (max-width 1777px, 22px padding),
// (Round 1 drew side borders at ≥1920; round 2 has none.)
import { StickerCodeByBand } from "@/framer/StickerCode"
import styles from "./03-sticker-views.module.css"

// The live instance's props (≥1920 and 1200–1919), spec "Base instance".
const BASE = {
    textA: "Bouncy",
    textB: "Adaptable",
    textC: "Unassuming",
    // Themed in the module CSS; the fallbacks are the light values.
    stickerBg: "var(--sv-paper, #f4f4f4)",
    textColor: "var(--sv-accent, rgb(208, 226, 111))",
    backgroundColor: "var(--sv-accent, rgb(208, 226, 111))",
    totalCount: 150,
    duration: 6,
    bleedAmount: 20,
    jitter: 0.9,
    fontSize: 90,
    borderRadius: 12,
    seed: 236,
    once: true,
    debug: false,
    font: "full",
}

// Framer's per-breakpoint overrides (B1X1poNuE 810–1199, Ua6cntmFh 390–809, NMkprdVDQ ≤389).
const BANDS = {
    "810": { totalCount: 120, fontSize: 70 },
    "390": { totalCount: 50, fontSize: 40 },
    "389": { totalCount: 50, fontSize: 40 },
}

export default function StickerViews() {
    return (
        <section
            id="sticker-views"
            data-framer-name="sticker views"
            className="page-measure section-y relative z-[1] flex h-[50vh] flex-col items-center justify-center py-2.5 bp810:h-[80vh] bp1200:h-[100vh] bp1920:h-[95vh]"
        >
            <h2 className="font-demo absolute top-1/2 left-1/2 z-10 w-[268px] -translate-x-1/2 -translate-y-1/2 text-[40px] leading-[0.9] whitespace-pre-wrap break-words text-[#242424] dark:text-white [font-variation-settings:'wght'_700,'GEOM'_25] bp810:w-[400px] bp810:text-[48px] bp1200:left-[210px] bp1200:w-[811px] bp1200:translate-x-0 bp1200:text-[95px] bp1920:left-[46%] bp1920:-translate-x-1/2 bp1920:leading-none">
                An open, warm, brand-conscious sans serif.
            </h2>
            <div className={`relative z-0 h-px w-full flex-[1_0_0] ${styles.card}`}>
                <StickerCodeByBand base={BASE} bands={BANDS} />
            </div>
        </section>
    )
}
