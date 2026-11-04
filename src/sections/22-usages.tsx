// 22 · usages
// Built from: native (7 PNG mockups)
//
// "Examples": a wide neon Cal Sans tile with a credit, then a wall of six brand mockups
// (2 columns from 810 up, 1 below) with a second credit. Server component.
//
// Images are local copies of the Framer originals at the same four srcset steps
// (public/font/22-usages/<name>-<width>.png). The live page gives them empty alt; the
// mockups' content is obvious, so they get short descriptions. They are dark, opaque
// tiles, so in dark mode they get a hairline so their edges don't sink into the page.
//
// Fixed from the live page: the phone heading was unsized (16px); it's 20px like 810+.
import { Section } from "./Section"

const DIR = "/font/22-usages"

type Img = { name: string; w: number; h: number; alt: string }

const NEON: Img = {
    name: "neon",
    w: 2400,
    h: 1260,
    alt: "Three glowing cards over a large “Cal Sans” wordmark: Cal Sans UI, Cal Sans Text, and Cal Sans Geo, each “just landed”.",
}

// Phone order (and the 2-column grid's row-by-row order): -04, -05, -07, -06, -10, -08.
// At 810+ that puts -04, -07, -10 in the left column and -05, -06, -08 in the right,
// matching the live page's two masonry stacks (all six are 16:9, so rows line up).
const WALL: Img[] = [
    { name: "mock-04", w: 4000, h: 2250, alt: "A real-estate site, Firstlight, with the headline “287 Park Ave.” under photos of an apartment." },
    { name: "mock-05", w: 4000, h: 2250, alt: "A Firstlight listing page: a description of 287 Park Ave. on an ochre band, above interior photos." },
    { name: "mock-07", w: 4000, h: 2250, alt: "An artist's portfolio index on orange: a table of works, years, and media around a painting of traffic cones." },
    { name: "mock-06", w: 4000, h: 2250, alt: "The same portfolio index on green, with a painting of a thicket of trees." },
    { name: "mock-10", w: 4000, h: 2250, alt: "A landing page over a mountain range at sunset: “To give you a clearer view of what comes next.”" },
    { name: "mock-08", w: 4000, h: 2250, alt: "A phone app screen listing orders, with unfulfilled and archived tabs." },
]

// The live page's `sizes` (spec Assets), unchanged: the 12px gutter, then the column's
// padding per band, halved for the wall's two columns.
const PAD = (band: "1920" | "810" | "1200" | "389" | "390") =>
    `max(min(100vw, 1801px) - 24px, 1px) - ${band === "1920" ? 128 : band === "810" || band === "1200" ? 64 : 40}px`
const SIZES_NEON = [
    `(min-width: 1920px) max(${PAD("1920")}, 1px)`,
    `(min-width: 810px) and (max-width: 1199.98px) max(${PAD("810")}, 1px)`,
    `(min-width: 1200px) and (max-width: 1919.98px) max(${PAD("1200")}, 1px)`,
    `(max-width: 389.98px) max(${PAD("389")}, 1px)`,
    `(min-width: 390px) and (max-width: 809.98px) max(${PAD("390")}, 1px)`,
].join(", ")
const SIZES_WALL = [
    `(min-width: 1920px) max((max(${PAD("1920")}, 1px) - 10px) / 2, 50px)`,
    `(min-width: 810px) and (max-width: 1199.98px) max((max(${PAD("810")}, 1px) - 10px) / 2, 50px)`,
    `(min-width: 1200px) and (max-width: 1919.98px) max((max(${PAD("1200")}, 1px) - 10px) / 2, 50px)`,
    `(max-width: 389.98px) max(${PAD("389")}, 1px)`,
    `(min-width: 390px) and (max-width: 809.98px) max(${PAD("390")}, 1px)`,
].join(", ")

function srcSet({ name, w }: Img) {
    return [512, 1024, 2048, w].map((s) => `${DIR}/${name}-${s}.png ${s}w`).join(", ")
}

function Picture({ img, sizes, className }: { img: Img; sizes: string; className: string }) {
    return (
        <div className={`relative w-full flex-none self-start ${className}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Framer's own srcset steps, served as static files */}
            <img
                src={`${DIR}/${img.name}-${img.w}.png`}
                srcSet={srcSet(img)}
                sizes={sizes}
                width={img.w}
                height={img.h}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 block size-full rounded-[inherit] object-cover object-center dark:outline dark:outline-1 dark:-outline-offset-1 dark:outline-white/15"
            />
        </div>
    )
}

const credit =
    "m-0 w-full text-center text-[14px] leading-4 text-muted-foreground [font-feature-settings:'tnum'_on,'case'_on] [font-variation-settings:'wght'_500] whitespace-pre-wrap break-words"

export default function Usages() {
    return (
        <Section id="usages" framerName="usages">
            <div
                data-framer-name="examples"
                className="relative flex w-px flex-[1_0_0] flex-row items-start justify-center py-5 bp810:py-8 bp1920:py-16"
            >
                <div className="flex w-px flex-[1_0_0] flex-col items-start justify-start gap-6 overflow-hidden">
                    <h2 className="m-0 w-full text-subhead text-held font-normal whitespace-pre-wrap break-words">
                        Examples
                    </h2>
                    <div
                        data-framer-name="graphic"
                        className="flex w-full flex-col items-center justify-center gap-2.5 overflow-clip bg-background"
                    >
                        <Picture img={NEON} sizes={SIZES_NEON} className="aspect-[1.90476] rounded-[inherit]" />
                        <p className={credit}>Creative Direction by Timothy Luke.</p>
                    </div>
                    <div className="flex w-full flex-col items-center justify-center gap-2.5 overflow-clip">
                        <div
                            data-framer-name="images"
                            className="relative grid w-full flex-none grid-cols-1 gap-2.5 bp810:grid-cols-2"
                        >
                            {WALL.map((img) => (
                                <Picture key={img.name} img={img} sizes={SIZES_WALL} className="aspect-video" />
                            ))}
                        </div>
                        {/* Two spaces between "UI" and "and", as published. */}
                        <p className={credit}>{"Mock brands using Cal Sans UI  and Cal Sans Text by Elliott Walker."}</p>
                    </div>
                </div>
            </div>
        </Section>
    )
}
