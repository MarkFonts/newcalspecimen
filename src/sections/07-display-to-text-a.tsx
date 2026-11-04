// 07 · Display to text (a)
// Built from: VariableMorph2
//
// A heading and a paragraph about the Text cut over a huge "Cal.com" that morphs between
// three drawings, with three labels below it lighting up in turn (VariableMorph2, props
// per band in src/framer/VariableMorph2.tsx).
//
// Geometry as in Framer: the wordmark is centered on a 0×0 point in the middle of a fixed
// 1276×382 stage, itself centered in a 358px-tall row, so on narrow screens the stage
// spills equally both ways and the section's overflow: clip trims it. The labels hang
// below that point (top: 100% + labelOffset), outside the component's own box; the row
// height and the stack's bottom padding are what leave room for them. Don't give the
// component container a size: that moves the labels. Framer's invisible 100px
// font-loading "Cal.com" is dropped.
import { VariableMorph2 } from "@/framer/VariableMorph2"
import styles from "./07-display-to-text-a.module.css"
import { Section, SECTION_STACK } from "./Section"

// Framer's code preset (lhgdw1): Paper Mono at the paragraph's size, #333 on 10% black,
// radius 6px, padding .1em .2em. Dark mode: foreground on 10% white.
const CODE =
    "rounded-[6px] bg-[#0000001a] px-[0.2em] py-[0.1em] font-mono font-normal text-[#333] dark:bg-[#ffffff1a] dark:text-foreground"

export default function DisplayToTextA() {
    return (
        <Section
            id="display-to-text-a"
            framerName="Display to text"
            className="flex-col bp810:z-[2] bp1200:z-auto"
        >
            <div className={SECTION_STACK}>
                {/* Text Wrapper */}
                <div className="flex w-full flex-col items-center justify-center gap-6 overflow-hidden">
                    <div className="flex w-full items-center justify-center">
                        <div className="flex w-px max-w-[800px] flex-[1_0_0] flex-col items-center justify-center gap-2.5">
                            <h2 className="w-full text-left text-subhead">
                                Drawn for performance
                            </h2>
                            <p className="w-full text-left text-lede text-held">
                                How do you build successful text? A fully redrawn Cal Sans Text characterset optimized for
                                Tailwind’s <code className={CODE}>text-sm</code> and{" "}
                                <code className={CODE}>text{"‑"}base</code> aka 14px/10.5pt and 16px/12pt type sizes,
                                respectively. For starters, round-shaped letters are slightly squeezed to save space, but
                                still differentiate from square-shaped{" "}letters. Glyphs and metrics of the families
                                have been enlarged 103–105% to work the way you expect, no surprises.
                            </p>
                        </div>
                    </div>
                </div>
                {/* The wordmark row: 358px tall, the 1276×382 stage centered in it */}
                <div className="flex h-[358px] w-min items-center justify-center gap-2.5 pb-5 bp810:pb-[30px] bp1200:pb-0">
                    <div className="flex h-[382px] w-[1276px] flex-none flex-col items-center justify-center gap-2.5 bp1200:p-12">
                        <div className={`relative ${styles.morph}`}>
                            <VariableMorph2 />
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    )
}
