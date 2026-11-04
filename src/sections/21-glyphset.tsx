// 21 · Glyphset
// Built from: GlyphPicker (+ SharedTester controls)
//
// A glyph browser: sticky left panel (controls + a huge preview of the picked glyph), and
// on the right every glyph in the font, grouped. GlyphPicker takes no props. Its own
// breakpoints (900 and 428, viewport) are kept as they are, not moved to Framer's.
//
// The left panel is position: sticky, so no ancestor here may scroll or hide overflow:
// this section and the page wrapper use overflow: clip, which doesn't create a scroll
// container; the bordered column is overflow: visible.
//
// Colors and the font are set from 21-glyphset.module.css through the component's own
// --cs-gp-* variables; the component is not edited.
import { GlyphPicker } from "@/framer/GlyphPicker"
import styles from "./21-glyphset.module.css"
import { Section } from "./Section"

export default function Glyphset() {
    return (
        <Section id="glyphset" framerName="Glyphset">
            <div
                data-framer-name="Glyphs"
                className={`${styles.glyphs} relative z-[1] flex w-px flex-[1_0_0] flex-col items-start justify-start overflow-visible `}
            >
                <div className="relative z-[1] w-full flex-none">
                    <GlyphPicker />
                </div>
            </div>
        </Section>
    )
}
