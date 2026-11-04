// 18 · Opentype new
// Built from: CalFeatureSpecimen (28 instances)
//
// Two blocks: 20 stylistic-set tiles (ss01–ss20) and 8 layout-feature tiles. Server
// component; the tiles are client components through src/framer/CalFeatureSpecimen.
//
// Per-breakpoint sizes reach the component as CSS variables (--fs-set, --fs-layout, and
// --fs-label, which only the stylistic-set tiles shrink on phones), set on the column per
// band, so the server render is right at every width.
// The four per-band text overrides (instances 1, 10, 11, 17) are twin instances that the
// bands show and hide, as Framer does.
//
// Fixed from the live page: "stylstic" → "stylistic"; the phone headings were unsized
// (16px) and are 20px like 810+. Colors are tokens; group 2's literal #111 / #999 are
// unified with group 1's foreground / muted-foreground.
import { CalFeatureSpecimen } from "@/framer/CalFeatureSpecimen"
import styles from "./18-opentype.module.css"
import { Section } from "./Section"

type Tile = {
    feature: string
    feature2?: string
    geom: number
    sample: string
    /** sample/label per band where the live page overrides them */
    phone?: { sample?: string; labelOverride?: string }
    desktop?: { sample?: string } // 1200–1919 only
}

// Instances 1–20, page order (spec instance table).
const SETS: Tile[] = [
    { feature: "ss01", geom: 25, sample: "Wanda Fanta?", phone: { sample: "Want Fanta?" } },
    { feature: "ss02", geom: 50, sample: "æther gaze" },
    { feature: "ss03", geom: 50, sample: "Clear, calm" },
    { feature: "ss04", geom: 0, sample: "31—gallium" },
    { feature: "ss05", geom: 25, sample: "90 Tiếng Việt" },
    { feature: "ss06", geom: 25, sample: "GONG" },
    { feature: "ss07", geom: 100, sample: "Good Gravy" },
    { feature: "ss08", geom: 100, sample: "Fancy jars" },
    { feature: "ss09", geom: 50, sample: "acts justify" },
    { feature: "ss10", geom: 25, sample: "counterforma", phone: { sample: "fractals" } },
    { feature: "ss11", geom: 25, sample: "affluent chai", phone: { labelOverride: "ss11 — Futura alts & liga" } },
    { feature: "ss12", geom: 25, sample: "MAGIC" },
    { feature: "ss13", geom: 100, sample: "Martian" },
    { feature: "ss14", geom: 0, sample: "Tứ jý fút" },
    { feature: "ss15", geom: 50, sample: "Fitófago" },
    { feature: "ss16", geom: 0, sample: "6 in 9 girls" },
    { feature: "ss17", geom: 25, sample: "brood 96", desktop: { sample: "blood 1996" } },
    { feature: "ss18", geom: 25, sample: "grâce à l’IA" },
    { feature: "ss19", geom: 62, sample: "Mutuality" },
    { feature: "ss20", geom: 25, sample: "$14 Zenvy" },
]

// Instances 21–28.
const LAYOUT: Tile[] = [
    { feature: "tnum", feature2: "pnum", geom: 25, sample: "$20.81 or ⃁78.13 " },
    { feature: "pnum", feature2: "tnum", geom: 25, sample: "525,600 minutes" },
    { feature: "frac", feature2: "pnum", geom: 25, sample: "1/2 is not 1 11/20, 62/40" },
    { feature: "titl", feature2: "pnum", geom: 25, sample: "Gatsby’s €10,249" },
    { feature: "sups", feature2: "pnum", geom: 25, sample: "z − y = x48" },
    { feature: "subs", feature2: "pnum", geom: 25, sample: "As2O3 + HNO3" },
    { feature: "zero", feature2: "none", geom: 25, sample: "pw bond007" },
    { feature: "dlig", feature2: "none", geom: 25, sample: "sniffly waft" },
]

// Props every instance shares (spec "Props common to all instances"); colors → tokens.
const COMMON = {
    weight: 400,
    gap: 8,
    padding: "24px",
    showLabel: true,
    hoverShowsDefault: true,
    labelOverride: "",
    cardBg: "var(--muted)",
    textColor: "var(--foreground)",
    labelColor: "var(--muted-foreground)",
    style: { width: "100%" },
}

function Specimen({ tile, group, sample, labelOverride }: { tile: Tile; group: 1 | 2; sample?: string; labelOverride?: string }) {
    return (
        <CalFeatureSpecimen
            {...COMMON}
            feature={tile.feature}
            feature2={tile.feature2 ?? "none"}
            geom={tile.geom}
            opsz={group === 1 ? 25 : 40}
            fontSize={group === 1 ? "var(--fs-set)" : "var(--fs-layout)"}
            labelSize={group === 1 ? "var(--fs-label)" : 13}
            sample={sample ?? tile.sample}
            labelOverride={labelOverride ?? ""}
        />
    )
}

// One grid cell. Tiles with per-band overrides render a twin per band group and let CSS
// pick: phone (≤809) vs the rest, or 1200–1919 vs the rest.
function TileCell({ tile, group }: { tile: Tile; group: 1 | 2 }) {
    const cell = "w-full self-start"
    if (tile.phone)
        return (
            <div className={cell}>
                <div className="bp810:hidden">
                    <Specimen tile={tile} group={group} sample={tile.phone.sample} labelOverride={tile.phone.labelOverride} />
                </div>
                <div className="max-bp810:hidden">
                    <Specimen tile={tile} group={group} />
                </div>
            </div>
        )
    if (tile.desktop)
        return (
            <div className={cell}>
                <div className="hidden bp1200:block">
                    <Specimen tile={tile} group={group} sample={tile.desktop.sample} />
                </div>
                <div className="bp1200:hidden">
                    <Specimen tile={tile} group={group} />
                </div>
            </div>
        )
    return (
        <div className={cell}>
            <Specimen tile={tile} group={group} />
        </div>
    )
}

// Heading block: a 1-column grid that becomes 2 columns (heading left, right cell empty)
// at 1200. Cal Sans with font-optical-sizing auto; GEOM 50 heading, GEOM 25 + tnum body.
function Heading({ title, children }: { title: string; children: string }) {
    return (
        <div className="grid w-full grid-cols-1 gap-2.5 overflow-clip bp1200:grid-cols-2">
            <div className="flex w-full flex-col items-start gap-6 self-start overflow-hidden">
                <h2 className="m-0 w-full text-subhead text-held font-normal whitespace-pre-wrap break-words">
                    {title}
                </h2>
                <p className="m-0 w-full text-lede text-held [font-feature-settings:'tnum'_on] whitespace-pre-wrap break-words">
                    {children}
                </p>
            </div>
        </div>
    )
}

export default function Opentype() {
    return (
        <Section
            id="opentype"
            framerName="Opentype new"
            className="flex-col"
        >
            <div
                data-framer-name="opentype"
                className={`relative w-full flex flex-col items-start gap-[42px] py-5 [line-height:normal] bp810:gap-8 bp810:py-8 bp1200:gap-16 bp1920:py-16 ${styles.tiles} [--fs-label:9px] [--fs-layout:35px] [--fs-set:20px] bp810:[--fs-label:13px] bp810:[--fs-layout:80px] bp810:[--fs-set:45px] bp1200:[--fs-layout:65px]`}
            >
                <Heading title={"OpenType features—stylistic sets (ssXX)"}>
                    {
                        "Font features or variants that refer to different glyphs in the Cal Sans OpenType font. Cal Sans is special—it juggles so many alternatives that stylistic sets were necessary for both versions of each glyphs, if you were in a zone with a new alternative. Roll over or tap to see the default glyph."
                    }
                </Heading>
                <div className="grid w-full auto-rows-fr grid-cols-2 gap-2.5 pb-[50px] bp1200:grid-cols-3">
                    {SETS.map((t) => (
                        <TileCell key={t.feature} tile={t} group={1} />
                    ))}
                </div>
                <Heading title={"OpenType features—layout"}>
                    {
                        "Font features that bring designs across the finish line, that professionals memorize and rely on. Roll over to see default settings or opposite configurations."
                    }
                </Heading>
                <div className="grid w-full auto-rows-fr grid-cols-1 gap-2.5 bp1200:grid-cols-2">
                    {LAYOUT.map((t) => (
                        <TileCell key={t.feature} tile={t} group={2} />
                    ))}
                </div>
            </div>
        </Section>
    )
}
