// 15 · typer
// Built from: TypewriterEffect
//
// A heading and subtitle over one huge typed line: 250px type, shrunk by a transform per
// band (1 at ≥1920, 0.7 at 1200–1919, 0.5 at 810–1199, 0.2 below 810). The transform
// leaves the layout box alone, so the line's 350px min-height holds the band height
// (626 / 626 / 530 / 506–530 px), exactly as on the live page.
//
// The page hides the divider after this section below 810 (app/font/page.tsx).
import { TypewriterEffect } from "@/framer/TypewriterEffect"
import { Section } from "./Section"

// The published English copy (Framer's localization fallbacks v109–v116), in order.
const WORDS = [
    "Website UI",
    "Client Layouts",
    "10px Text",
    "300px Text",
    "Framer Page",
    "Mom’s Card",
    "Vibey Poster",
    "Free for y’all",
].map((word) => ({ word }))

export default function Typer() {
    return (
        <Section id="typer" framerName="typer">
            {/* Section: the column (round 2: no side rules; round 1 drew Framer's 1px overlay). */}
            <div
                data-framer-name="Section"
                className="relative flex w-px flex-[1_0_0] flex-col items-center justify-center gap-5 py-5 bp810:gap-8 bp810:py-8 bp1200:gap-16 bp1200:py-16"
            >
                <div
                    data-framer-name="Text Wrapper"
                    className="flex w-full max-w-[800px] flex-none flex-col items-center justify-center gap-6 overflow-hidden text-left"
                >
                    <h2 className="w-full text-subhead">
                        For every project throughout the universe
                    </h2>
                    <p className="w-full text-lede">
                        Cal Sans UI is OFL, which means type it, print it, embed it anywhere you please. Free.
                    </p>
                </div>
                <div className="relative z-[2] min-h-[350px] flex-none scale-[0.2] bp810:scale-50 bp1200:scale-[0.7] bp1920:scale-100">
                    <TypewriterEffect
                        words={WORDS}
                        typingSpeed={100}
                        deletingSpeed={60}
                        pauseDuration={1200}
                        cursorColor="var(--muted-foreground)"
                        cursorWidth={5}
                        cursorHeight={100}
                        textColor="var(--foreground)"
                        // What the live page really renders (its .force-cal rule beats the
                        // prop's Framer font): Cal Sans at 400, GEOM default 25, auto opsz.
                        font={{
                            fontFamily: "var(--font-demo)",
                            fontSize: "250px",
                            fontStyle: "normal",
                            fontWeight: 400,
                            letterSpacing: "-0.02em",
                            lineHeight: "1.2em",
                            fontOpticalSizing: "auto",
                        }}
                    />
                </div>
            </div>
        </Section>
    )
}
