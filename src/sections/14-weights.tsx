// 14 · Weights
// Built from: CalFitSource + withCalFitReceiver
//
// "Display": all 32 Display style names at one uniform size, fitted so the widest
// ("Cal Sans A11y SemiBold Italic", which is the CalFitSource line itself) spans the
// column. The other 31 rows carry `.cal-fit` and take its size from `--cal-fit` on
// <html> (14-weights.module.css). "Text": the 32 Text names at fixed sizes, roman and
// italic side by side. Below 810 every name drops its "Cal Sans " prefix.
//
// Framer's withCalSans / withCalSansItalic overrides become direct styles here: the font
// is the demo class (font-demo, the port's own Cal Sans 2.011), and each row sets `"wght" W, "GEOM" G` (plus `"ital" 1`
// and font-style italic) instead of Framer's MODE→GEOM remap.
//
// Server component; only CalFitSource crosses into the client.
import type { CSSProperties, ReactNode } from "react"
import { CalFitSource } from "@/framer/CalFitSource"
import styles from "./14-weights.module.css"
import { Section } from "./Section"

const WEIGHTS = [
    { name: "Regular", wght: 400 },
    { name: "Medium", wght: 500 },
    { name: "SemiBold", wght: 600 },
    { name: "Bold", wght: 700 },
] as const

// The four geometries. `word` is the name part ("" for Base, whose name is elided).
const GEOMS = [
    { key: "A11y", word: "A11y", geom: 0 },
    { key: "UI", word: "UI", geom: 25 },
    { key: "Base", word: "", geom: 50 },
    { key: "Geo", word: "Geo", geom: 100 },
] as const

// The name as on the live page: "Cal Sans Text A11y Medium Italic" from 810 up, without
// the "Cal Sans " prefix below. Kept verbatim, trailing space included, for the Base
// italic Regular rows ("Cal Sans Italic ", "Cal Sans Text Italic ").
function styleName(text: boolean, word: string, weight: string, italic: boolean) {
    const w = italic ? (weight === "Regular" ? "Italic " : `${weight} Italic`) : weight
    return [text ? "Text" : "", word, w].filter(Boolean).join(" ")
}

function axes(wght: number, geom: number, italic: boolean, opsz?: number): CSSProperties {
    return {
        fontWeight: wght,
        fontStyle: italic ? "italic" : "normal",
        fontVariationSettings: `${opsz ? `"opsz" ${opsz}, ` : ""}"wght" ${wght}, "GEOM" ${geom}${italic ? `, "ital" 1` : ""}`,
    }
}

const Prefix = () => <span className="max-bp810:hidden">Cal Sans </span>

// Gray label above each group: 13px below 810, 20px from 810.
function Label({ children, geom }: { children: ReactNode; geom: number }) {
    return (
        <p
            className="w-full text-left text-[13px] leading-[1.5] text-muted-foreground bp810:text-[20px]"
            style={{ fontVariationSettings: `"wght" 400, "GEOM" ${geom}` }}
        >
            {children}
        </p>
    )
}

// A Display name row: fitted size, line-height 1.1em, opsz pinned at 45 (as its label
// says, and as the source measures; the live page draws phone rows at auto opsz).
function FitRow({ word, weight, wght, geom, italic }: { word: string; weight: string; wght: number; geom: number; italic: boolean }) {
    return (
        <h2
            className="cal-fit font-demo w-full text-left leading-[1.1] text-foreground [font-optical-sizing:none]"
            style={axes(wght, geom, italic, 45)}
        >
            <Prefix />
            {styleName(false, word, weight, italic)}
        </h2>
    )
}

// The source line, in the A11y italic group between Medium Italic and Bold Italic. One
// copy per text (Framer's phone variant drops the prefix and floors at 25px); the hidden
// copy measures 0 wide and doesn't publish.
function Source() {
    const common = { font: "full", weight: 600, geom: 0, italic: true, opsz: 45, color: "var(--foreground)" }
    return (
        <>
            <div className={`${styles.source} w-full max-bp810:hidden`}>
                <CalFitSource {...common} text="Cal Sans A11y SemiBold Italic" minSize={30} />
            </div>
            <div className={`${styles.source} w-full bp810:hidden`}>
                <CalFitSource {...common} text="A11y SemiBold Italic" minSize={25} />
            </div>
        </>
    )
}

function DisplayGroup({ g, italic }: { g: (typeof GEOMS)[number]; italic: boolean }) {
    const label = `OPSZ 45 · GEOM ${g.geom}${italic ? " · ITAL 1" : ""}`
    const rows = WEIGHTS.map((w) =>
        italic && g.key === "A11y" && w.name === "SemiBold" ? (
            <Source key={w.name} />
        ) : (
            <FitRow key={w.name} word={g.word} weight={w.name} wght={w.wght} geom={g.geom} italic={italic} />
        )
    )
    // Gaps as published: the roman groups stack their rows with no gap; the italic groups
    // hold theirs in an inner column (2px below 810, 10px from 810; Geo's is 0), and UI
    // italic alone has a 2px label gap at 390–809.
    const outerGap = italic && g.key === "UI" ? "bp390:gap-0.5 bp810:gap-0" : ""
    const innerGap = g.key === "Geo" ? "" : "gap-0.5 bp810:gap-2.5"
    return (
        <div
            data-framer-name={`${g.key} ${italic ? "Italic " : ""}Weights`}
            className={`flex w-full flex-none flex-col items-center justify-center pb-5 ${g.key === "A11y" ? "overflow-visible" : "overflow-clip"} ${outerGap}`}
        >
            {/* Display labels sit in a MODE 0 layer, which Framer remaps to GEOM 0. */}
            <Label geom={0}>{label}</Label>
            {italic ? (
                <div className={`flex w-full flex-none flex-col items-center justify-center ${g.key === "A11y" ? "overflow-visible" : "overflow-clip"} ${innerGap}`}>
                    {rows}
                </div>
            ) : (
                rows
            )}
        </div>
    )
}

// A Text-cut column (roman or italic) of one Text row: label + four names at fixed sizes.
function TextColumn({ g, italic }: { g: (typeof GEOMS)[number]; italic: boolean }) {
    const rows = WEIGHTS.map((w) => (
        <h2
            key={w.name}
            className="font-demo w-full text-left text-[13px] leading-[1.1] text-foreground bp810:text-[20px] bp1200:text-[30px]"
            style={axes(w.wght, g.geom, italic)}
        >
            <Prefix />
            {styleName(true, g.word, w.name, italic)}
        </h2>
    ))
    return (
        <div
            data-framer-name={`${g.key} ${italic ? "Italic " : ""}Weights`}
            className="flex w-px flex-[1_0_0] flex-col items-center justify-center gap-0.5 overflow-clip pb-[13px] bp810:gap-2.5 bp810:pb-5"
        >
            {/* Text labels carry GEOM 25 explicitly. */}
            <Label geom={25}>{`GEOM ${g.geom}${italic ? " · ITAL 1" : ""}`}</Label>
            {italic ? (
                <div className="flex w-full flex-none flex-col items-center justify-center gap-0.5 overflow-clip bp810:gap-2.5">
                    {rows}
                </div>
            ) : (
                rows
            )}
        </div>
    )
}

export default function Weights() {
    return (
        <Section
            id="weights"
            framerName="Weights"
            className="bp390:gap-0 bp810:gap-2.5"
        >
            {/* Section: the column (round 2: no side rules; round 1 drew Framer's 1px overlay). */}
            <div
                data-framer-name="Section"
                className="relative flex w-px flex-[1_0_0] flex-col items-center justify-center bp810:gap-8 bp810:py-8 bp1200:gap-16 bp1920:py-16"
            >
                <div
                    data-framer-name="Text Wrapper"
                    className={`${styles.fit} flex w-full max-w-full flex-none flex-col items-start justify-start gap-6`}
                >
                    <h2 className="min-w-[100px] text-left text-subhead">Weights</h2>
                    <div data-framer-name="Display" className="flex w-full flex-none flex-col items-center justify-center gap-2.5 overflow-clip">
                        {GEOMS.map((g) => (
                            <DisplayGroupPair key={g.key} g={g} />
                        ))}
                    </div>
                    <div
                        data-framer-name="Text"
                        className="flex w-full flex-none flex-col items-center justify-center gap-2.5 overflow-clip bp390:gap-0 bp810:gap-2.5"
                    >
                        {GEOMS.map((g) => (
                            <div
                                key={g.key}
                                data-framer-name={`${g.key} Text`}
                                className="flex w-full flex-none flex-row items-center justify-center overflow-clip bp810:gap-2.5"
                            >
                                <TextColumn g={g} italic={false} />
                                <TextColumn g={g} italic />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Section>
    )
}

function DisplayGroupPair({ g }: { g: (typeof GEOMS)[number] }) {
    return (
        <>
            <DisplayGroup g={g} italic={false} />
            <DisplayGroup g={g} italic />
        </>
    )
}
