// 19 · Icons and Emojis
// Built from: native text
//
// Two labeled glyph runs set very large. Server component, no client code.
//
// Font: 47 of the 52 symbol and arrow code points are NOT in the Latin subset that
// font-sans uses (only • ↑ → ↓ ← are), and font-sans (next/font) has no fall-through to
// the full face. So the runs use font-glyphs, the full Cal Sans 2.011, which has every
// one of the 52 (checked with fontTools against fonts/CalSansVF-full.woff2). The live page
// sets these in Framer's old "Cal Sans UI Variable Light"; this renders them in 2.011.
//
// Axes: the runs carry Framer's "MODE" 1, which Cal Sans 2 doesn't have, and no GEOM, so
// they take the font's default GEOM. The 'blwf' feature on the live runs is dropped: the
// font has no such feature. cv03, cv04, cv09, and cv11 are kept as authored.
import { Section } from "./Section"

const RUN_SYMBOLS = "⍟■□☑☒✓✗★☆✦✧♡♥✨●○◌◆◇◼▲△▶▷▼▽◀◁⭑⭒•◦▪▫▴▵▸▹▾▿◂◃"
const RUN_ARROWS = "↑↗→↘↓↙←↖↔↕"

const h2 =
    "m-0 w-full text-[28px] leading-[1.5] font-bold tracking-[-0.03em] text-foreground [font-variation-settings:'wght'_700,'GEOM'_50] whitespace-pre-wrap break-words"
const run =
    "m-0 w-full font-glyphs leading-[1.6] tracking-[0.1em] text-foreground [font-feature-settings:'cv09'_on,'cv03'_on,'cv04'_on,'cv11'_on] [font-variation-settings:'wght'_400] whitespace-pre-wrap break-words"

export default function IconsAndEmojis() {
    return (
        <Section id="icons-and-emojis" framerName="Icons and Emojis">
            <div
                data-framer-name="opentype"
                className="relative flex w-px flex-[1_0_0] flex-col items-start gap-[42px] py-5 bp810:gap-8 bp810:py-8 bp1200:gap-16 bp1920:py-16"
            >
                <div className="flex w-full flex-col items-start gap-6 overflow-hidden">
                    {/* Two spaces between "Emoji" and "&", as published. */}
                    <h2 className={h2}>{"Emoji  & Symbols"}</h2>
                    <p className={`${run} text-[38px] bp810:text-[100px] bp1200:text-[99px] bp1920:text-[100px]`}>{RUN_SYMBOLS}</p>
                    <h2 className={h2}>Arrows</h2>
                    <p className={`${run} text-[38px] bp810:text-[96px] bp1200:text-[100px]`}>{RUN_ARROWS}</p>
                </div>
            </div>
        </Section>
    )
}
