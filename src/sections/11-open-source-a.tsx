// 11 · Open Source (a)
// Built from: OpenSourceMagnet + 2 chart SVGs
//
// "Make it yours", the draggable "Open Source" magnet word with its three stickers, then
// "Fork and download it online…" and the GEOM axis chart: CalSansVF-GEOM-v10 at ≥1200,
// GeomAxis below. The charts are inlined (not <img>) so the theme reaches their colors;
// see the module CSS for the recolor.
import { readFileSync } from "node:fs"
import path from "node:path"
import { OpenSourceMagnet } from "@/framer/OpenSourceMagnet"
import styles from "./11-open-source-a.module.css"
import { Section } from "./Section"

// Read once, on the server (the page prerenders). Each file is ~20 KB without its fonts.
const CHART_DIR = path.join(process.cwd(), "public/font/11-open-source-a")
const GEOM_V10_SVG = readFileSync(path.join(CHART_DIR, "geom-v10.svg"), "utf8")
const GEOM_AXIS_SVG = readFileSync(path.join(CHART_DIR, "geom-axis.svg"), "utf8")

export default function OpenSourceA() {
    return (
        <Section
            id="open-source-a"
            framerName="Open Source (a)"
            className="overflow-visible"
        >
            {/* Section: the column */}
            <div className="relative flex w-px flex-[1_0_0] flex-col items-center justify-center gap-5 py-5 bp810:gap-8 bp810:py-8 bp1200:gap-16 bp1200:py-16">
                {/* Text Wrapper 1 */}
                <div className="flex w-full max-w-[800px] flex-col items-center gap-6 overflow-hidden text-left">
                    <h2 className="w-full text-subhead">
                        Make it yours
                    </h2>
                    <p className="w-full text-lede">
                        Remix it. Build on it. Start your own. See something you’d change? Open an issue and let’s
                        talk. Most typographic “edge cases” are just undiscovered use{" "}cases.
                    </p>
                </div>

                {/* The magnet: width and height follow its letters */}
                <div className="relative flex-none">
                    <OpenSourceMagnet />
                </div>

                {/* Text Wrapper 2 (Framer's force-cal-auto layer: automatic optical sizing) */}
                <div className="flex w-full max-w-[800px] flex-col items-center gap-6 overflow-hidden text-left [font-optical-sizing:auto]">
                    <h2 className="w-full text-subhead">
                        Fork and download it online, no font design tools needed
                    </h2>
                    {/* 20px at every band, phones included, as on the live page */}
                    <p className="w-full text-lede text-held">
                        Change “swap” points of glyphs in your own{" "}
                        <a className={styles.link} href="https://wordmark.nyc/recalsans" target="_blank" rel="">
                            ReCal Sans
                        </a>{" "}
                        OFL Fork ReBuilder, or change the default set, remap the optical size for large print or
                        5-foot TV display.
                    </p>
                </div>

                {/* CalSansVF-GEOM-v10, ≥1200: 16:9, on the plate radius (round 2; Framer's were 10px) */}
                <div
                    data-framer-name="CalSansVF-GEOM-v10"
                    className={`hidden aspect-[1.77778] w-full overflow-hidden bp1200:block ${styles.chart} ${styles.v10}`}
                    dangerouslySetInnerHTML={{ __html: GEOM_V10_SVG }}
                />
                {/* GeomAxis, ≤1199: the viewBox is cropped to the card Framer drew inside its 1920×1650 frame, so the card fills the column; corners from .chart */}
                <div
                    data-framer-name="GeomAxis"
                    className={`aspect-[1.17609] w-full bp1200:hidden ${styles.chart} ${styles.axis}`}
                    dangerouslySetInnerHTML={{ __html: GEOM_AXIS_SVG }}
                />
            </div>
        </Section>
    )
}
