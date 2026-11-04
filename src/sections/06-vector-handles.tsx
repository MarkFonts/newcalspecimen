// 06 · Vector Handles - animation
// Built from: VariableMorph
//
// A heading and one line of copy over a 300px "a" that morphs between two drawings
// (VariableMorph, defaults at every breakpoint). The glyph is centered on a 0×0 point in
// a 250px-tall row and overflows it in every direction; the 150px top padding keeps it
// clear of the copy. Framer's invisible 100px font-loading "a" is dropped: the Cal Anim
// Graph 6 face is declared in the layout's literal @font-face block.
import { VariableMorph } from "@/framer/VariableMorph"
import styles from "./06-vector-handles.module.css"
import { Section, SECTION_STACK } from "./Section"

export default function VectorHandles() {
    return (
        <Section
            id="vector-handles"
            framerName="Vector Handles - animation"
            className="flex-col bp810:z-[2] bp1200:z-auto"
        >
            <div className={SECTION_STACK}>
                {/* Text Wrapper */}
                <div className="flex w-full flex-col items-center justify-center gap-6 overflow-hidden">
                    <div className="flex w-full items-center justify-center">
                        <div className="flex w-px max-w-[800px] flex-[1_0_0] flex-col items-center justify-center gap-2.5">
                            <h2 className="w-full text-left text-subhead">
                                Made for humans
                            </h2>
                            <p className="w-full text-left text-lede">
                                Like its namesake product, Cal Sans is easy to use. Every vector placed to automatically
                                balance geometry or flow just right for{" "}you.
                            </p>
                        </div>
                    </div>
                </div>
                {/* The glyph row */}
                <div className="flex w-full items-center justify-center gap-2.5 pt-[150px] pb-5 bp810:pb-[30px] bp1200:pb-0">
                    <div className="flex h-[250px] w-full flex-col items-center justify-center gap-2.5 bp1200:p-12">
                        <div className={`relative ${styles.morph}`} aria-label="a" role="img">
                            <VariableMorph />
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    )
}
