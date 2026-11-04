// 17 · Paragraphs
// Built from: native (Framer layers under withCalSans)
//
// Sixteen text specimens: four rows (Text A11y, Text UI, Text, Text Geo) × four weights.
// Each cell: a 3px colored top rule, a gray "Cal Sans Text" line, the weight name, a
// colored GEOM pill (not in the Text row), and a literary excerpt clamped to 16 lines.
// From 810px a row is four cells across; below 810 a 2×2 grid. Server component.
//
// Font: Cal Sans 2.011 (font-demo: the cells are specimens) with `"wght" W, "GEOM" G` set directly, in
// place of Framer's MODE→GEOM remap; optical sizing auto, as on the live page.
import type { CSSProperties } from "react"
import { Section } from "./Section"

// The ten body passages, exactly as on the live page (extracted from the published HTML
// with the recipe in the spec; ids, lengths, and MD5 prefixes match its table). Their
// licensing is Mark's and Cal.com's call (see the spec); ids 3 and 6 look in copyright.
const BODIES: Record<number, string> = {
    1: "Architects, sculptors, painters—we all must return to craftsmanship! For there is no such thing as “art by profession.” There is no essential difference between the artist and the artisan. The artist is an exalted artisan. Merciful heaven, in rare moments of illumination beyond man’s will, may allow art to blossom from the works of his hand, but the foundations of proficiency are indispensable to every artist. This is the original source of creative design. So let us therefore create a new guild of craftsmen, free of the divisive class pretensions that endeavoured to raise a prideful barrier between craftsmen and artists! Let us strive for, conceive and create the new building of the future that will unite every discipline, architecture and sculpture and painting, and which will one day rise heavenwards from the million hands of craftsmen as a clear symbol of a new belief to come. The art schools of old were incapable of producing this unity—and how could they, for art may not be taught. They must return to the workshop. This world of mere drawing and painting of draughtsmen and applied artists must at long last become a world that builds. When a young person who senses within himself a love for creative endeavour begins his career, as in the past, by learning a trade, the unproductive “artist” will no longer be condemned to the imperfect practice of art because his skill is now preserved in craftsmanship, where he may achieve excellence.",
    2: "When the shadow of the sash appeared on the curtains it was between seven and eight o’clock and then I was in time again, hearing the watch. It was Grandfather’s and when Father gave it to me he said, Quentin, I give you the mausoleum of all hope and desire; it’s rather excruciatingly apt that you will use it to gain the reducto absurdum of all human experience which can fit your individual needs no better than it fitted his or his father’s. I give it to you not that you may remember time, but that you might forget it now and then for a moment and not spend all your breath trying to conquer it. Because no battle is ever won he said. They are not even fought. The field only reveals to man his own folly and despair, and victory is an illusion of philosophers and fools. It was propped against the collar box and I lay listening to it. Hearing it, that is. I don’t suppose anybody ever deliberately listens to a watch or a clock. You don’t have to. You can be oblivious to the sound for a long while, then in a second of ticking it can create in the mind unbroken the long diminishing parade of time you didn’t hear. Like Father said down the long and lonely lightrays you might see Jesus walking, like. And the good Saint Francis that said Little Sister Death, that never had a sister.",
    3: "A screaming comes across the sky. It has happened before, but there is nothing to compare it to now. It is too late. The Evacuation still proceeds, but it’s all theatre. There are no lights inside the cars. No light anywhere. Above him lift girders old as an iron queen, and glass somewhere far above that would let the light of day through. But it’s night. He’s afraid of the way the glass will fall—soon—it will be a spectacle: the fall of a crystal palace. But coming down in total blackout, without one glint of light, only great invisible crashing. Inside the carriage, which is built on several levels, he sits in velveteen darkness, with nothing to smoke, feeling metal nearer and farther rub and connect, steam escaping in puffs, a vibration in the carriage’s frame, a poising, an uneasiness, all the others pressed in around, feeble ones, second sheep, all out of luck and time: drunks, old veterans still in shock from ordnance 20 years obsolete, hustlers in city clothes, derelicts, exhausted women with more children than it seems could belong to anyone, stacked about among the rest of the things to be carried out to salvation.",
    4: "It was the year of Our Lord one thousand seven hundred and seventy-five. Spiritual revelations were conceded to England at that favoured period, as at this. Mrs. Southcott had recently attained her five-and-twentieth blessed birthday, of whom a prophetic private in the Life Guards had heralded the sublime appearance by announcing that arrangements were made for the swallowing up of London and Westminster. Even the Cock-lane ghost had been laid only a round dozen of years, after rapping out its messages, as the spirits of this very year last past (supernaturally deficient in originality) rapped out theirs. Mere messages in the earthly order of events had lately come to the English Crown and People, from a congress of British subjects in America: which, strange to relate, have proved more important to the human race than any communications yet received through any of the chickens of the Cock-lane brood.",
    5: "Architects, sculptors, painters—we all must return to craftsmanship! For there is no such thing as “art by profession.” There is no essential difference between the artist and the artisan. The artist is an exalted artisan. Merciful heaven, in rare moments of illumination beyond man’s will, may allow art to blossom from the works of his hand, but the foundations of proficiency are indispensable to every artist. This is the original source of creative design. So let us therefore create a new guild of craftsmen, free of the divisive class pretensions that endeavoured to raise a prideful barrier between craftsmen and artists! Let us strive for, conceive and create the new building of the future that will unite every discipline, architecture and sculpture and painting, and which will one day rise heavenwards from the million hands of craftsmen as a clear symbol of a new belief to come. The art schools of old were incapable of producing this unity—and how could they, for art may not be taught. They must return to the workshop. This world of mere drawing and painting of draughtsmen and applied artists must at long last become a world that builds.",
    6: "A screaming comes across the sky. It has happened before, but there is nothing to compare it to now. It is too late. The Evacuation still proceeds, but it’s all theatre. There are no lights inside the cars. No light anywhere. Above him lift girders old as an iron queen, and glass somewhere far above that would let the light of day through. But it’s night. He’s afraid of the way the glass will fall—soon—it will be a spectacle: the fall of a crystal palace. But coming down in total blackout, without one glint of light, only great invisible crashing. Inside the carriage, which is built on several levels, he sits in velveteen darkness, with nothing to smoke, feeling metal nearer and farther rub and connect, steam escaping in puffs, a vibration in the carriage’s frame, a poising, an uneasiness, all the others pressed in around, feeble ones, second sheep, all out of luck and time: drunks, old veterans still in shock from ordnance 20 years obsolete, hustlers in city clothes, derelicts, exhausted women with more children than it seems could belong to anyone, stacked about among the rest of the things to be carried out to salvation. Only the nearer faces are visible to all, and at that only as half-silvered images in a view finder, green-stained VIP faces remembered behind bulletproof windows speeding through the city",
    7: "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the  season of Darkness, it was the spring of hope, it was the winter of despair, we had everything before us, we had nothing before us, we were all going direct to Heaven, we were all going direct the other way—in short, the period was so far like the present period, that some of its noisiest authorities insisted on its being received, for good or for evil, in the superlative degree of comparison only. There were a king with a large jaw and a queen with a plain face, on the throne of England; there were a king with a large jaw and a queen with a fair face, on the throne of France. In both countries it was clearer than crystal to the lords of the State preserves of loaves and fishes, that things in general were settled for ever.",
    8: "Das Staatliche Bauhaus in Weimar int durch Vereinigung der ehemaligen Großherzoglich Sächsischen Hochschule für bildende Kunst mit der ehemaligen Großherzoglich Sächsischen Kunstgewerbeschule unter Neuangliediederung einer Abteilung für Baukunst enstanden. Das Bauhaus erstrebt die Sammlung alles künstlerischen Schaffens zur Einheit, die Wiedervereinigung aller werke künstlerischen Disziplinen — Bildhauerei, Malerei, Kunstgewerbe und Handwerk — zu einer neuen Baukunst als deren unablösliehe Bestandteile. Das letzte, wenn auch ferne Ziel des Bauhauses ist das Einheits Kunstwerk — der große Bau — in dem es keine Grenze gibt zwischen monumentaler und dekorativer Kunst. Das Staatliche Bauhaus in Weimar int durch Vereinigung der ehemaligen Großherzoglich ",
    9: "Kunst entsteht oberhalb aller Methoden, sie ist an sich nicht lehrbar, wohl aber das Handwerk., Architekten, Maler, Bildhauer sind Handwerker im Ursinn des Wortes, deshalb wird als unerlaßliche Grundlage für alles bildnerische Schaffen die gründliche handwerkliche Ausbildung aller Studierenden in Werkstätten und auf Probier- und Werk-plätzen gefordert. Die eigenen Werkstätten sollen allmählich ausgebaut, mit fremden Werkstätten Lehrverträge abgeschlossen werden. Die Schule ist die Dienerin der Werkstatt, sie wird eines Tages in ihr aufgehen. Deshalb nicht Lehrer und Schüler im Bauhaus, sondern Meister, Gesellen und Lehrlinge. Kunst entsteht oberhalb aller Methoden, sie ist an sich nicht lehrbar, wohl aber das Handwerk., Architekten, Maler, Bildhauer sind ",
    10: "France, less favoured on the whole as to matters spiritual than her sister of the shield and trident, rolled with exceeding smoothness down hill, making paper money and spending it. Under the guidance of her Christian pastors, she entertained herself, besides, with such humane achievements as sentencing a youth to have his hands cut off, his tongue torn out with pincers, and his body burned alive, because he had not kneeled down in the rain to do honour to a dirty procession of monks which passed within his view, at a distance of some fifty or sixty yards. It is likely enough that, rooted in the woods of France and Norway, there were growing trees, when that sufferer was put to death, already marked by the Woodman, Fate, to come down and be sawn into boards, to make a certain movable framework with a sack and a knife in it, terrible in history. It is likely enough that in the rough outhouses of some tillers of the heavy lands adjacent to Paris, there were sheltered from the weather that very day, rude carts, bespattered with rustic mire, snuffed about by pigs, and roosted in by poultry, which the Farmer, Death, had already set apart to be his tumbrils of the Revolution. But that Woodman and that Farmer, though they work unceasingly, work silently, and no one heard them as they went about with muffled tread: the rather, forasmuch as to entertain any suspicion that they were awake, was to be atheistical and traitorous.",
}

const WEIGHTS = [
    { name: "Regular", wght: 400 },
    { name: "Medium", wght: 500 },
    { name: "SemiBold", wght: 600 },
    { name: "Bold", wght: 700 },
] as const

// The Text row's rules are #242424 at 40 / 60 / 80 / 100%: the foreground token at the
// same alphas, so they stay visible in dark. The twelve hues are categorical: literal.
const fg = (pct: number) => `color-mix(in srgb, var(--foreground) ${pct}%, transparent)`

type Row = {
    name: string
    geom: number
    badge?: string
    colors: [string, string, string, string]
    bodies: [number, number, number, number]
}

const ROWS: Row[] = [
    { name: "Text A11y", geom: 0, badge: "GEOM 0: A11Y", colors: ["#f4c247", "#f1a73f", "#eb682c", "#be321c"], bodies: [1, 2, 3, 4] },
    { name: "Text UI", geom: 25, badge: "GEOM 25: UI", colors: ["#78cbf9", "#5498f7", "#3d65f5", "#6358c4"], bodies: [1, 2, 3, 4] },
    { name: "Text", geom: 50, colors: [fg(40), fg(60), fg(80), "var(--foreground)"], bodies: [5, 2, 6, 7] },
    { name: "Text Geo", geom: 100, badge: "GEOM 100: GEO", colors: ["#80d78b", "#56bb4c", "#43963e", "#2e6c2c"], bodies: [8, 2, 9, 10] },
]

// Rich text shared by the two header lines and the body: balanced wrap, 16-line clamp.
const RICH = "w-full text-left leading-[1.3] text-balance line-clamp-16"

function Cell({ row, i }: { row: Row; i: number }) {
    const w = WEIGHTS[i]
    return (
        <div
            data-framer-name="Text Mode"
            className="flex w-full flex-none place-self-start items-start justify-center gap-8 overflow-hidden bp810:w-px bp810:flex-[1_0_0] bp810:place-self-auto"
        >
            <div
                className="font-demo flex w-px flex-[1_0_0] flex-col items-start justify-start gap-4 overflow-clip"
                style={{ fontWeight: w.wght, fontVariationSettings: `"wght" ${w.wght}, "GEOM" ${row.geom}` }}
            >
                {/* Header block: the colored 3px rule is an overlay (Framer's data-border),
                    so it takes no layout space; the 15px top padding clears it. */}
                <div
                    className="relative flex w-full flex-none flex-col items-center justify-center overflow-clip pt-[15px] after:pointer-events-none after:absolute after:inset-0 after:border-t-[3px] after:border-(--rule) after:content-['']"
                    style={{ "--rule": row.colors[i] } as CSSProperties}
                >
                    <h2 className={`${RICH} text-[20px] text-muted-foreground`}>Cal Sans Text</h2>
                    <p className={`${RICH} text-[20px] text-foreground`}>{w.name}</p>
                </div>
                {row.badge && (
                    <div
                        data-framer-name="Badge"
                        className="flex w-min flex-none items-center justify-center gap-2.5 overflow-clip rounded-[3px] p-1.5"
                        style={{ backgroundColor: row.colors[i] }}
                    >
                        {/* Fixed white: it sits on a saturated pill in both themes. */}
                        <p
                            className="text-[14px] leading-[11px] whitespace-nowrap text-white uppercase"
                            style={{ fontWeight: 600, fontVariationSettings: '"wght" 600, "GEOM" 25' }}
                        >
                            {row.badge}
                        </p>
                    </div>
                )}
                <p className={`${RICH} text-[15px] text-foreground bp810:text-[13px] bp1200:text-[15px]`}>
                    {BODIES[row.bodies[i]]}
                </p>
            </div>
        </div>
    )
}

export default function Paragraphs() {
    return (
        <Section
            id="paragraphs"
            framerName="Paragraphs"
            wide
            className="flex-col"
        >
            {/* Paragraphs color: the column; round 2: no side rules. */}
            <div
                data-framer-name="Paragraphs color"
                className="relative flex w-full flex-col items-center justify-center gap-5 overflow-clip p-5 bp1200:gap-16 bp1200:p-8 bp1920:p-16"
            >
                {ROWS.map((row) => (
                    <div
                        key={row.name}
                        data-framer-name={row.name}
                        className="grid w-full grid-cols-[repeat(2,minmax(50px,1fr))] grid-rows-[repeat(2,minmax(0,1fr))] auto-rows-[minmax(0,1fr)] gap-3 bp810:flex bp810:flex-row bp810:items-start bp810:justify-center bp810:gap-4 bp1200:gap-8"
                    >
                        {WEIGHTS.map((_, i) => (
                            <Cell key={i} row={row} i={i} />
                        ))}
                    </div>
                ))}
            </div>
        </Section>
    )
}
