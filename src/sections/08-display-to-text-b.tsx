// 08 · Display to text (b)
// Built from: OpticalSizeDemo
//
// A heading and a paragraph about automatic optical sizing, then a scroll-driven
// specimen: a 400vh root with a sticky 100vh stage, where a type-scale ruler slides past
// a needle as opsz runs 8 → 45 (OpticalSizeDemo, props per band in
// src/framer/OpticalSizeDemo.tsx, including the hexLerp fix).
//
// The window is the scroller. Every ancestor of the stage must stay overflow visible or
// clip (clip makes no scroll container, so sticky still pins): the section and the page
// wrapper use clip, everything in between is visible.
//
// The demo's box is only as wide as its content (stage inset + text width), centered in
// the stack. Below 810 the section drops its 1801px max-width, as in Framer.
import { OpticalSizeDemo } from "@/framer/OpticalSizeDemo"
import { Section, SECTION_STACK } from "./Section"

export default function DisplayToTextB() {
    return (
        <Section
            id="display-to-text-b"
            framerName="Display to text"
            className="flex-col gap-6 bp810:z-[2] bp1200:z-auto"
        >
            <div className={SECTION_STACK}>
                {/* Text Wrapper */}
                <div className="flex w-full flex-col items-center justify-center gap-6">
                    <div className="flex w-full max-w-[800px] flex-col items-center justify-center gap-2.5">
                        <h2 className="w-full text-left text-subhead">
                            Get better-looking layout, in any size, for free.
                        </h2>
                        <p className="w-full text-left text-lede text-held">
                            Automatic optical sizing in variable fonts like Cal Sans is enabled by default in web browsers,
                            Apple Core Text, Windows 11, DirectWrite, and typographically-oriented software like InDesign.
                            Spend less time choosing cuts of Cal Sans and more time building pristine text.
                        </p>
                    </div>
                    <div className="flex w-min flex-col items-center justify-center gap-2.5">
                        <div className="relative w-auto flex-none">
                            <OpticalSizeDemo />
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    )
}
