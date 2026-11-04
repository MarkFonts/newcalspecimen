// 09 · Text with Blur - Animation (a)
// Built from: native text + Framer's "Blur-text 2"
//
// A heading and paragraph about legibility under blur, then the word "acted" blurring
// and sharpening on a 2 s / 2 s loop (src/framer/BlurText.tsx). Per band:
//   word size 89 / 89 / 230 / 300 / 300 px, blur 6 / 6 / 14 / 18 / 18 px
//   stack padding and gap 20 / 20 / 32 / 64+24 / 64+24, text 16px on phones, 20px from 810 (text-subhead, text-lede).
import { BlurText } from "@/framer/BlurText"
import { Section, SECTION_STACK } from "./Section"

export default function TextBlurA() {
    return (
        <Section
            id="text-blur-a"
            framerName="Text with Blur - Animation (a)"
            className="flex-col bp810:max-bp1200:z-[2]"
        >
            {/* Stack: the bordered column */}
            <div className={SECTION_STACK}>
                {/* Text Wrapper */}
                <div className="flex w-full flex-col items-center gap-6 overflow-hidden">
                    <div className="flex w-full flex-col items-center gap-2.5">
                        <div className="flex w-full flex-row items-center justify-center">
                            <div className="flex w-px max-w-[800px] flex-[1_0_0] flex-col items-center gap-2.5 text-left">
                                <h2 className="w-full text-subhead">
                                    Big apertures for legible letters
                                </h2>
                                <p className="w-full text-lede">
                                    The acid test for legibility is to simulate the inevitable bad conditions. This
                                    separates the beautiful type designs from the dryly functional. I recommend
                                    blurring it. This simulates quickly-moving eyes, poor light, a far screen, or
                                    degenerative optical{" "}conditions.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* The word's row and column */}
                <div className="flex w-full flex-row items-center justify-center gap-2.5 pb-5 bp810:pb-[30px] bp1200:pb-0">
                    <div className="flex w-full flex-col items-center justify-center gap-2.5 bp1200:p-12">
                        <BlurText
                            text="acted"
                            // 700, GEOM 25; opsz stays automatic (force-cal-auto), so 45 at these sizes
                            style={{ fontVariationSettings: '"wght" 700, "GEOM" 25' }}
                            className="font-demo text-foreground text-[89px] [--blur:6px] bp810:text-[230px] bp810:[--blur:14px] bp1200:text-[300px] bp1200:[--blur:18px]"
                        />
                    </div>
                </div>
            </div>
        </Section>
    )
}
