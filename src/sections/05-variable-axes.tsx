// 05 · 6 Variable Axes
// Built from: CalAxes, one per card
//
// "Version 2.000" and one line of copy over a grid of six cards, one per variable axis.
// Each card's specimen ping-pongs its axis (CalAxes, all six in lockstep). Hovering, or
// focusing, a card fades in an overlay with the feature name and a description (Framer's
// Hover variant: 0.4s tween, ease [.44,0,.56,1]; the corner dots move from 24px to 12px).
//
// The card is Framer's "Variable Axis Animation" component, rebuilt here as markup: its
// hover is CSS (group-hover / group-focus-visible), so the section stays a server
// component and only CalAxes crosses into the client. Framer's resting overlay text,
// "Feature text", was an unbound placeholder; the overlay always shows the feature name.
import { CalAxes } from "@/framer/CalAxes"
import styles from "./05-variable-axes.module.css"
import { Section, SECTION_STACK } from "./Section"

type Card = {
    n: string
    tag: "opsz" | "GEOM" | "wght" | "YTAS" | "SHRP" | "ital"
    name: string
    description: string
    specimen: string
}

const CARDS: Card[] = [
    {
        n: "01",
        tag: "opsz",
        name: "Optical Size",
        description: "Adjusts size-specific letter spacing and apertures, and picks the right alternates for you",
        specimen: "System",
    },
    { n: "02", tag: "GEOM", name: "Geometric Form", description: "Swaps hundreds of letter variants in sync", specimen: "Ing Calt" },
    {
        n: "03",
        tag: "wght",
        name: "Weight",
        description: "Fine tune the thickness of letters in-between styles for precise contrast or preference",
        specimen: "Warm",
    },
    {
        n: "04",
        tag: "YTAS",
        name: "Ascender Height",
        description:
            "Parametrically adjust tall lowercase letters to distinguish from Capitals, numerals, and short lowercase",
        specimen: "flooding",
    },
    {
        n: "05",
        tag: "SHRP",
        name: "Sharpness",
        description: "Control the corners formed by joining strokes to become perfectly pointed, or blunt",
        specimen: "ANEWZ",
    },
    { n: "06", tag: "ital", name: "Italic", description: "Slant glyphs by 9.5° for emphasis", specimen: "italics" },
]

// Framer's hover tween: 0.4s, cubic-bezier(.44,0,.56,1), on every property that changes.
const TWEEN = "duration-[400ms] ease-[cubic-bezier(0.44,0,0.56,1)]"

// The four corner dots: 6×6, 24px in at rest, 12px in on hover.
const DOTS = [
    "top-6 left-6 group-hover:top-3 group-hover:left-3 group-focus-visible:top-3 group-focus-visible:left-3",
    "top-6 right-6 group-hover:top-3 group-hover:right-3 group-focus-visible:top-3 group-focus-visible:right-3",
    "bottom-6 left-6 group-hover:bottom-3 group-hover:left-3 group-focus-visible:bottom-3 group-focus-visible:left-3",
    "bottom-6 right-6 group-hover:bottom-3 group-hover:right-3 group-focus-visible:bottom-3 group-focus-visible:right-3",
]

function AxisCard({ n, tag, name, description, specimen }: Card) {
    return (
        <div
            tabIndex={0}
            aria-label={`${name} (${tag}): ${description}`}
            className="group relative flex h-full w-full flex-col items-center justify-start gap-3.5 rounded-2xl border border-border bg-card p-3.5 shadow-[0_1px_5px_-4px_rgba(36,36,36,0.7),0_4px_8px_0_rgba(36,36,36,0.05)] outline-none focus-visible:ring-2 focus-visible:ring-ring dark:shadow-none"
        >
            <div className="flex h-px w-full flex-[1_0_0] flex-col items-center justify-center gap-[5px]">
                {/* Number badge + axis tag */}
                <div className="flex w-full items-center justify-start gap-2.5">
                    <div className="flex h-[30px] w-[33px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#e5e7eb] dark:bg-muted">
                        <p className="h-4 w-[21px] text-left text-base leading-[1em] text-muted-foreground tabular-nums [font-variation-settings:'wght'_400,'GEOM'_0]">
                            {n}
                        </p>
                    </div>
                    <div className="flex h-[18px] w-px flex-[1_0_0] items-center justify-center pr-8">
                        <h3
                            className={`w-[110px] text-center text-base leading-[1.3] text-foreground/33 transition-colors ${TWEEN} [font-variation-settings:var(--fvs-subhead)] group-hover:text-foreground group-focus-visible:text-foreground`}
                        >
                            {tag}
                        </h3>
                    </div>
                </div>
                {/* The specimen, centered in the space left */}
                <div className="flex h-px w-full flex-[1_0_0] items-center justify-center gap-2.5" aria-hidden="true">
                    <div className="flex w-px flex-[1_0_0] items-center justify-center">
                        <div className={`relative ${styles.specimen}`} data-axis={tag}>
                            <CalAxes axis={tag} text={specimen} />
                        </div>
                    </div>
                </div>
                {/* Feature name, centered in the bottom 30% */}
                <div className="flex h-[30%] w-full items-center justify-center gap-2.5">
                    <h3 className="flex h-full w-[152px] flex-col justify-center text-center text-base leading-[1.3] text-foreground [font-variation-settings:var(--fvs-subhead)]">
                        {name}
                    </h3>
                </div>
            </div>

            {/* Hover Wrapper: covers the card, fades in */}
            <div
                className={`absolute inset-0 z-[2] flex flex-col items-center justify-center gap-[18px] rounded-2xl bg-card p-4 opacity-0 transition-opacity ${TWEEN} group-hover:opacity-100 group-focus-visible:opacity-100`}
                aria-hidden="true"
            >
                <p className="w-[152px] text-center text-base leading-[1.5] text-foreground">{name}</p>
                <p className="w-full text-center text-base leading-[1.5] text-muted-foreground">{description}</p>
                {DOTS.map((pos) => (
                    <div
                        key={pos}
                        className={`absolute z-[1] size-1.5 rounded-full bg-[#e0e0e0] shadow-[inset_0_1px_1.9px_0_rgba(0,0,0,0.16)] transition-[top,right,bottom,left] ${TWEEN} dark:bg-[#ffffff26] dark:shadow-[inset_0_1px_1.9px_0_rgba(0,0,0,0.5)] ${pos}`}
                    />
                ))}
            </div>
        </div>
    )
}

export default function VariableAxes() {
    return (
        <Section
            id="variable-axes"
            framerName="6 Variable Axes"
            className="flex-col bp810:z-[2] bp1200:z-auto"
        >
            <div className={SECTION_STACK}>
                {/* Text Wrapper */}
                <div className="flex w-full flex-col items-center justify-center gap-6 overflow-hidden">
                    <div className="flex w-full items-center justify-center">
                        <div className="flex w-px max-w-[800px] flex-[1_0_0] flex-col items-center justify-center gap-2.5">
                            <h2 className="w-full text-left text-subhead text-held">
                                Version 2.000
                            </h2>
                            <p className="w-full text-left text-lede">
                                Simple, bold, confident for brands like Cal.com—now from billboard to button. 600 to 1,530
                                glyphs. Six variable axes. Hundreds of static options. It’s ready, are you?
                            </p>
                        </div>
                    </div>
                </div>
                {/* The grid: 1 / 2 / 3 columns, fixed total heights as in Framer */}
                <div className="grid h-[1500px] w-full grid-cols-1 grid-rows-6 justify-center gap-5 bp810:h-[800px] bp810:grid-cols-2 bp810:grid-rows-3 bp1200:h-[683px] bp1200:grid-cols-3 bp1200:grid-rows-2">
                    {CARDS.map((card) => (
                        <AxisCard key={card.tag} {...card} />
                    ))}
                </div>
            </div>
        </Section>
    )
}
