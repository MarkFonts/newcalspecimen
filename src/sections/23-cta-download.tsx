// 23 · CTA download NPM
// Built from: Copy (×2) + Framer's Button, rebuilt
//
// The download panel: four cards in a 2×2 grid (1 column below 1200). Server component;
// only the two Copy icons are client code. The panel keeps id="calsans-download", the
// in-page target of the site header's Download button.
//
// Framer's native "Button" (variant Primary) isn't a code file, so it's rebuilt here as an
// <a>: the dark gradient face, and on hover the dot in the chevron slot stretches into a
// bar that, with the chevron, reads as an arrow. In dark mode the face inverts (light).
//
// Fixed from the live page: the logo labels had no color (browser black) and use the
// foreground token; the phone headings were unsized (16px) and are 20px like 810+; the
// two target="_blank" links get rel="noopener noreferrer".
import { Copy } from "@/framer/Copy"
import { Section } from "./Section"

const DIR = "/font/23-cta-download"

const h2 =
    "m-0 w-full text-subhead text-held font-normal whitespace-pre-wrap break-words"
const body =
    "m-0 w-full text-lede text-[18px] whitespace-pre-wrap break-words"
const card = "flex w-full flex-col items-start justify-start self-start gap-[15px] overflow-hidden bp810:gap-3 bp1200:gap-[15px]"
// Cal Sans at 35 / 49px, GEOM 25, optical size from the font size.
const logoLabel =
    "m-0 text-[35px] leading-[1.2] text-foreground [font-variation-settings:var(--fvs-lede)] w-px flex-[1_0_0] whitespace-pre-wrap break-words bp810:w-auto bp810:flex-none bp810:text-[49px] bp810:whitespace-pre"

function Button({ href, children }: { href: string; children: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            data-framer-name="Button"
            className="group flex h-min w-min shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[12px] border border-primary bg-[linear-gradient(180deg,#292929_0%,var(--primary)_100%)] px-3 py-2 whitespace-nowrap text-primary-foreground no-underline shadow-[inset_0_2px_0_0_rgba(255,255,255,0.15)] dark:bg-[linear-gradient(180deg,#f2f2f2_0%,var(--primary)_100%)] dark:shadow-[inset_0_2px_0_0_rgba(255,255,255,0.7)]"
        >
            <span className="text-[14px] leading-5 [font-variation-settings:'wght'_400]">{children}</span>
            {/* "Chevron to Arrow": a 2px dot beside the chevron; on hover it becomes an 8px
                bar and the chevron slides right 1.5px, so the two read as an arrow. */}
            <span aria-hidden="true" className="relative block h-[13px] w-[14px] flex-none group-hover:h-[14px]">
                <span className="absolute top-1/2 left-[2px] h-[2px] w-2 -translate-y-1/2 translate-x-[3px] scale-x-25 rounded-full bg-[#898989] transition-transform duration-500 ease-out group-hover:translate-x-0 group-hover:scale-x-100 dark:bg-[#737373]" />
                <svg
                    viewBox="0 0 7 10"
                    width="7"
                    height="10"
                    fill="none"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500 ease-out group-hover:translate-x-[calc(-50%+1.5px)]"
                >
                    <path
                        d="M 1.5 9 L 5.5 5 L 1.5 1"
                        className="stroke-[#898989] dark:stroke-[#737373]"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
        </a>
    )
}

function Command({ comment, command }: { comment: string; command: string }) {
    return (
        <div className="relative flex h-min w-full flex-none items-center justify-center gap-2.5 overflow-clip bp1200:w-px bp1200:flex-[1_0_0]">
            <div className="relative h-[70px] w-px flex-[1_0_0] overflow-clip rounded-[3px] bg-muted">
                <div className="absolute top-5 right-[15px] left-[15px] flex items-center justify-end">
                    <div className="relative flex-none cursor-pointer">
                        <Copy textToCopy={command} color="var(--foreground)" successColor="rgb(111, 163, 240)" size={16} />
                    </div>
                </div>
                <p className="absolute top-[47%] left-5 m-0 w-auto -translate-y-1/2 font-mono text-[14px] leading-4 whitespace-pre text-foreground [font-feature-settings:'cv08'_on,'tnum'_on,'case'_on] bp1200:left-[25px] bp1920:left-[30px]">
                    <span className="text-muted-foreground">{comment}</span>
                    <br />
                    {command}
                </p>
            </div>
        </div>
    )
}

export default function CtaDownload() {
    return (
        <Section id="cta-download" framerName="CTA download NPM">
            <div
                id="calsans-download"
                data-framer-name="Download"
                className="relative flex w-px flex-[1_0_0] scroll-mt-20 flex-col items-start justify-center gap-[50px] py-5 bp810:flex-row bp810:gap-8 bp810:py-8 bp1200:gap-16 bp1920:py-16"
            >
                <div className="grid w-full auto-rows-min grid-cols-1 justify-center gap-16 overflow-clip bp810:w-px bp810:flex-[1_0_0] bp810:gap-x-8 bp1200:grid-cols-2 bp1200:gap-x-16">
                    <div data-framer-name="GitHub Release" className={card}>
                        <h2 className={h2}>{"Download Cal Sans "}</h2>
                        <p className={body}>{"Using Cal Sans is as easy as downloading & installing the font files. "}</p>
                        <p className={body}>
                            Includes full glyph set and features, ttf, woff2, and variable font files. Licensed via OFL.
                        </p>
                        <Button href="https://github.com/calcom/sans/">Download font</Button>
                    </div>

                    <div data-framer-name="NPM" className={card}>
                        <h2 className={h2}>Install Cal Sans via NPM (Recommended)</h2>
                        <p className={body}>
                            {"Full glyph set, variable features, and "}
                            <code className="rounded-[6px] bg-foreground/10 px-[.2em] py-[.1em] font-mono font-normal text-foreground">
                                {"font‑feature‑settings"}
                            </code>
                            {" baked into Next.js projects."}
                        </p>
                        <div className="flex h-[150px] w-full flex-col items-start justify-center gap-2.5 bp1200:h-[85px] bp1200:flex-row">
                            <Command comment="# using npm" command="npm install cal-sans" />
                            <Command comment="# using yarn" command="yarn add cal-sans" />
                        </div>
                    </div>

                    <div data-framer-name="request adobe fonts" className={card}>
                        <div className="flex w-full flex-row items-center justify-start gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG logo */}
                            <img
                                src={`${DIR}/adobe-fonts.svg`}
                                width={85}
                                height={82}
                                alt=""
                                className="block h-[82px] w-[85px] shrink-0"
                            />
                            <p className={logoLabel}>Adobe Fonts</p>
                        </div>
                        <h2 className={h2}>Help bring Cal Sans to Adobe Fonts</h2>
                        <p className={body}>
                            The best for Creative Cloud workflows. Activate once, use across every Adobe app, and your desktop. Full glyph set, synced automatically. Open source license fonts can be added to the library at no cost to Adobe if enough people request it.
                        </p>
                        <Button href="https://adobefonts.uservoice.com/forums/940222-adobe-fonts-feature-requests-and-feedback/suggestions/51720489-cal-sans-sil-ofl-one-or-two-variable-files-gi">
                            Request on UserVoice
                        </Button>
                    </div>

                    <div data-framer-name="coming to google fonts" className={card}>
                        <div className="flex w-full flex-row items-center justify-start gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG logo */}
                            <img src={`${DIR}/google-fonts.svg`} width={85} height={85} alt="" className="block size-[85px] shrink-0" />
                            <p className={logoLabel}>Google Fonts</p>
                        </div>
                        <h2 className={h2}>Hosting via Google Fonts is coming soon</h2>
                        <p className={body}>
                            Subset character set and core OpenType features, ttf, woff2, and variable font files. Licensed via OFL.
                        </p>
                    </div>
                </div>
            </div>
        </Section>
    )
}
