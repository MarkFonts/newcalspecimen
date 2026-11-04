// 16 · Waterfall sample
// Built from: CalSansSpecimenCard (+ SharedTester controls)
//
// Sixteen editable specimen lines, each scaled to span the column: a header (name, GEOM
// pill, V / h / I toggles; two dropdowns and outlined toggles below 810) over one huge
// line. At 810–1199 the first eight interleave (UI, A11y, UI, A11y, …) by CSS order.
//
// Server component; the cards cross into the client through src/framer/.
import { CalSansSpecimenCard } from "@/framer/CalSansSpecimenCard"
import styles from "./16-waterfall-sample.module.css"
import { Section } from "./Section"

// [defaultContent, geom preset index (0 A11y, 1 UI, 3 Geo), weight, tablet order,
//  natural width at 100px in Cal Sans 2.011 (opsz 45; for the pre-fit box)]
// Strings exactly as published: trailing space in line 2, U+2019 in lines 3 and 4,
// "Dashbord" (sic) in line 12.
const LINES: [string, number, number, number, number][] = [
    ["Zigfield Follies Musical", 0, 400, 1, 929.25],
    ["I-41 Rockford, Illinois ", 0, 500, 3, 902.56],
    ["AI fitting Al’s text width", 0, 600, 5, 997.86],
    ["Boldly Go Design: ’96", 0, 700, 7, 939.75],
    ["Toggle button group 5", 1, 400, 0, 926.11],
    ["Loading ½ skeleton UI", 1, 500, 2, 929.06],
    ["Form and Tab field", 1, 600, 4, 806.42],
    ["2 Toast Notifications", 1, 700, 6, 891.86],
    ["Calendar & Date picker", 1, 400, 8, 949.95],
    ["Username search box 40", 1, 500, 9, 1066.58],
    ["Stepper & Pagination", 1, 600, 10, 929.17],
    ["Proto Dashbord Quirk", 1, 700, 11, 969],
    ["Die Fließtext Überschrift", 3, 400, 12, 981],
    ["Das Staatliches Bauhaus", 3, 500, 13, 1043.28],
    ["150th Nobel Foundation", 3, 600, 14, 1057.31],
    ["Real Disruption Zoning", 3, 700, 15, 1018.16],
]

// Tailwind needs the class names spelled out.
const TABLET_ORDER = [
    "bp810:order-0", "bp810:order-1", "bp810:order-2", "bp810:order-3",
    "bp810:order-4", "bp810:order-5", "bp810:order-6", "bp810:order-7",
    "bp810:order-8", "bp810:order-9", "bp810:order-10", "bp810:order-11",
    "bp810:order-12", "bp810:order-13", "bp810:order-14", "bp810:order-15",
]

export default function WaterfallSample() {
    return (
        <Section
            id="waterfall-sample"
            framerName="Waterfall sample"
            wide
        >
            {/* The column (a frame Framer also calls "Weights"); round 2: no side rules. */}
            <div
                data-framer-name="Weights"
                data-reveal-each="50"
                className={`${styles.column} relative flex w-px flex-[1_0_0] flex-col items-center justify-center gap-[5px] p-5 bp810:gap-4 bp810:p-8 bp1200:gap-8 bp1920:p-16`}
            >
                {LINES.map(([text, geom, weight, order, natural], i) => (
                    <CalSansSpecimenCard
                        key={text}
                        defaultContent={text}
                        geom={geom}
                        weight={weight}
                        tabletHeaderGap={i === 0 || i === 4 ? 5 : 8}
                        natural={natural}
                        cardClassName={styles.card}
                        className={`w-full flex-none ${TABLET_ORDER[order]} bp1200:order-none`}
                    />
                ))}
            </div>
        </Section>
    )
}
