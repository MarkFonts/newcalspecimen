// 12 · Open Source (b)
// Built from: CalThreeWaysCard ×3 (layout: round 2)
//
// "Three ways to use Cal Sans, anywhere": the heading and paragraph over three rows, beside one
// stage, as Cal.com's homepage shows its steps (src/framer/ThreeWaysTabs.tsx). Each specimen is a
// CalThreeWaysCard: the GEOM slider, the ssXX/cvXX chips, and the ReCal swap editor. Clock-driven,
// not scroll-driven. The mini control's hard-coded colors are themed in the module CSS.
import type { ReactNode } from "react"
import type { Way } from "@/framer/CalThreeWaysCard"
import { ThreeWaysTabs } from "@/framer/ThreeWaysTabs"
import styles from "./12-open-source-b.module.css"
import { Section } from "./Section"

function RecalLink({ children }: { children: ReactNode }) {
    return (
        <a className={styles.link} href="https://wordmark.nyc/recalsans" target="_blank" rel="">
            {children}
        </a>
    )
}

const WAYS: { label: ReactNode; way: Way; caption: ReactNode }[] = [
    {
        label: "GEOM Axis",
        way: "geom",
        caption: "The custom GEOM OpenType variable axis swaps hundreds of alternatives with one click",
    },
    {
        label: "ssXX & cvXX",
        way: "features",
        caption:
            "Stylistic Set and Character Variant OpenType features let you choose exactly what you want to change",
    },
    {
        label: (
            <>
                <span className="bp390:hidden">Fork ReCal</span>
                <span className="max-bp390:hidden">Fork ReCal Sans</span>
            </>
        ),
        way: "recal",
        caption: (
            <>
                Change “swap” points of glyphs in your own <RecalLink>ReCal Sans OFL Fork ReBuilder</RecalLink>, or
                change the default set, remap the optical size for large print or 5-foot TV display.
            </>
        ),
    },
]

export default function OpenSourceB() {
    return (
        <Section
            id="open-source-b"
            framerName="Open Source (b)"
            className="overflow-visible"
        >
            {/* Section: the column */}
            <div className="relative flex w-px flex-[1_0_0] flex-col items-center justify-center py-5 bp810:py-8 bp1200:py-16">
                <ThreeWaysTabs
                    items={WAYS}
                    intro={
                        // force-cal-auto: automatic optical sizing
                        <div className="flex w-full flex-col gap-6 text-left [font-optical-sizing:auto]">
                            <h2 className="w-full text-subhead">
                                Three ways to use Cal Sans, anywhere
                            </h2>
                            {/* 20px at every band, phones included, as on the live page */}
                            <p className="w-full text-lede text-held">
                                Change “swap” points of glyphs in your own <RecalLink>ReCal Sans</RecalLink> OFL Fork
                                ReBuilder, or change the default set, remap the optical size for large print or 5-foot
                                TV display.
                            </p>
                        </div>
                    }
                />
            </div>
        </Section>
    )
}
