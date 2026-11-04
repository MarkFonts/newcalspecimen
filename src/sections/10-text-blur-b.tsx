// 10 · Text with Blur - Animation (b)
// Built from: HOIGrid
//
// "Almost too future-proof": a heading and paragraph, then HOIGrid, eight Cal Sans Flex
// glyphs each morphing through its own GEOM bands with an orange radar ping. The Stack is
// 120vh tall (90vh at 810–1199) and the grid takes whatever the text leaves. Columns per
// band (2 / 2 / 3 / 3 / 4) are set in the module CSS. Click the grid to pause it.
import { HOIGrid } from "@/framer/HOIGrid"
import styles from "./10-text-blur-b.module.css"
import { Section, SECTION_STACK } from "./Section"

// The live instance's cells (page module, id VWqwK_xJm), not sandbox/presets.ts: I runs
// 5-8 and C runs 75-80 here.
const CELLS = [
    { glyph: "I", bands: "5-8", pings: "50,14; 50,79" },
    { glyph: "t", bands: "35-40, 75-80", pings: "50,79" },
    { glyph: "f", bands: "35-40, 75-80", pings: "60,14" },
    { glyph: "y", bands: "35-40, 75-80", pings: "40,100" },
    { glyph: "j", bands: "35-40, 75-80", pings: "40,100" },
    { glyph: "M", bands: "75-80", pings: "15,15; 85,15" },
    { glyph: "C", bands: "75-80", pings: "90, 25; 90,70" },
    { glyph: "9", bands: "80-75, 40-35", pings: "60,70" },
]

export default function TextBlurB() {
    return (
        <Section
            id="text-blur-b"
            framerName="Text with Blur - Animation (b)"
            className="flex-col bp810:max-bp1200:z-[2]"
        >
            {/* Stack */}
            <div className={`${SECTION_STACK} h-[120vh] bp810:max-bp1200:h-[90vh]`}>
                {/* Text Wrapper */}
                <div className="flex w-full flex-col items-center gap-6 overflow-hidden">
                    <div className="flex w-full flex-col items-center gap-2.5">
                        <div className="flex w-full flex-row items-center justify-center">
                            <div className="flex w-px max-w-[800px] flex-[1_0_0] flex-col items-center gap-2.5 text-left">
                                <h2 className="w-full text-subhead">
                                    Almost too future-proof
                                </h2>
                                <p className="w-full text-lede">
                                    If you’ve ever dreamed of being a trailblazer, you can use Cal Sans Flex VF to not
                                    only swap between alternatives, you can morph between them. It introduces more
                                    transition points so they can appear more often in animations and transitions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Grid host: takes all the height the text leaves */}
                <div className="flex h-px w-full flex-[1_0_0] flex-row items-center justify-center gap-2.5 pb-5 bp810:pb-[30px] bp1200:pb-0">
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2.5">
                        <div className={`relative h-px w-full flex-[1_0_0] ${styles.grid}`}>
                            <HOIGrid
                                cells={CELLS}
                                columns={4}
                                fontSize={140}
                                opticalSize={10}
                                weight={400}
                                gap={0}
                                speed={1}
                                paused={false}
                                debug={false}
                                pingSize={0.7}
                                glyphColor="var(--foreground)"
                                style={{ width: "100%", height: "100%" }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    )
}
