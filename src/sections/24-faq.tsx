// 24 · FAQ (kept from Cal.com's staging /font page, not from Framer)
// Built from: native, Cal.com's own markup
//
// Their FAQ, verbatim, in their markup and class conventions (staging, 2026-11-02): a
// sticky heading column with "Ask a question", and a list of rounded rows that open. On
// staging the rows are a Base UI accordion (client JS); here each row is a native
// <details>, so the section stays a server component and works without JS. Same look:
// the chevron in a round chip turns 180° when a row opens.
//
// Their tokens are used where they exist (--color-hp-field, --color-hp-raised for the row
// and chip), with this app's tokens as fallbacks so it also renders here. Two class
// names differ from staging: their `max-desktop:` / `max-tablet:` screens (1200 / 810)
// are this app's `max-bp1200:` / `max-bp810:`, and `text-hp-ink` is `text-foreground`.
//
// Type: staging's `font-display` comes out as Bold, GEOM 50, -0.01em on the headings and
// questions (read from their computed styles); restated here as utilities.
//
// Spacing: their `page-measure` and `section-y` aren't the ones in this app's globals.css
// (those carry Framer's geometry for the other sections), so this section restates
// staging's values as utilities: 1320px measure with 28px padding (16px and full width
// minus 16px below 810), and 128 / 96 / 72px vertical padding. In Cal.com's site they
// match their own classes, so they're harmless there.
//
// Not carried over: staging's "Ask anything else" input under the questions. It posts to
// their backend, which this page doesn't have; their team can add it back.

const QA: [string, string][] = [
    ["Who designed Cal Sans?", "Mark Davis, through his type practice WORDMARK. Cal.com commissioned the font and gives it away."],
    [
        "What changed in v2?",
        "Version 1, from 2021, was a single SemiBold for headlines. Version 2 is one variable font: three optical sizes (Cal Sans, Text and Micro), four styles (A11y, UI, Base and Geo) and every weight from Regular to Bold.",
    ],
    [
        "Can I use it in commercial work?",
        "Yes. The SIL Open Font License lets you use, embed, change and ship it in personal and commercial work. The one thing you can't do is sell the font on its own.",
    ],
    ["Which languages does it support?", "133 languages written in the Latin script, from Afrikaans and Basque to Welsh and Zulu."],
    [
        "Where do I report a problem?",
        "Open an issue on the calcom/sans repository on GitHub. Most odd results are edge cases nobody has tried yet, so they're worth reporting.",
    ],
]

function ChevronRight() {
    return (
        <svg aria-hidden="true" fill="none" height="10" width="7" viewBox="0 0 7 10" className="h-2.5 w-[7px] shrink-0">
            <path d="M1.5 9 5.5 5 1.5 1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        </svg>
    )
}

function ChevronDown() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            data-slot="accordion-indicator"
            className="pointer-events-none box-content size-3.5 shrink-0 translate-y-0 rounded-full bg-(--faq-toggle) p-[11px] text-foreground opacity-100 transition-transform duration-500 ease-[cubic-bezier(.19,1,.22,1)] group-open/item:rotate-180"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    )
}

export default function Faq() {
    return (
        <section
            id="faq"
            className="section-y w-full scroll-mt-20 py-[128px] max-bp1200:py-24 max-bp810:py-[72px]"
        >
            <div className="page-measure mx-auto grid w-[calc(100%-48px)] max-w-[1320px] grid-cols-[minmax(0,420px)_minmax(0,1fr)] items-start gap-16 px-[28px] max-bp810:w-[calc(100%-16px)] max-bp810:px-4 max-lg:grid-cols-1 max-lg:gap-10">
                <div className="sticky top-28 flex flex-col items-start max-lg:static" data-faq-head="true">
                    <h2 className="font-display m-0 text-[56px] leading-[1.05] font-bold tracking-[-0.01em] [font-variation-settings:'GEOM'_50] text-balance whitespace-pre-line text-foreground max-bp1200:text-[44px] max-bp810:text-[34px]">
                        Frequently asked questions
                    </h2>
                    <a
                        href="/contact"
                        data-slot="button"
                        className="relative mt-8 inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[12px] border border-input bg-popover px-3.5 pt-[2px] text-sm font-medium [font-variation-settings:'GEOM'_25] whitespace-nowrap text-foreground shadow-xs/5 outline-none transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background active:scale-[0.98] active:duration-100 dark:bg-input/32 dark:hover:bg-input/64 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:opacity-80"
                    >
                        Ask a question <ChevronRight />
                    </a>
                </div>
                <div
                    data-slot="accordion"
                    className="mt-0 grid w-full max-w-none gap-3 text-left [--faq-row:var(--color-hp-field,var(--muted))] [--faq-toggle:var(--color-hp-raised,var(--background))]"
                >
                    {QA.map(([q, a]) => (
                        <details
                            key={q}
                            data-slot="accordion-item"
                            className="group/item rounded-3xl border-0 bg-(--faq-row) max-md:rounded-[20px]"
                        >
                            <summary
                                data-slot="accordion-trigger"
                                className="flex flex-1 cursor-pointer list-none items-center justify-between gap-5 rounded-3xl py-5 pr-5 pl-6 text-left font-medium text-sm outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring max-md:gap-3 max-md:rounded-[20px] max-md:p-4 [&::-webkit-details-marker]:hidden"
                            >
                                <h3 className="font-display m-0 flex-1 text-[20px] leading-[1.3] font-bold tracking-[-0.01em] [font-variation-settings:'GEOM'_50] text-balance text-foreground max-md:text-[17px]">
                                    {q}
                                </h3>
                                <ChevronDown />
                            </summary>
                            <div data-slot="accordion-panel" className="text-sm text-muted-foreground">
                                <div className="pr-16 pb-6 pl-6 text-[16px] leading-[1.6] text-pretty text-foreground/80 max-md:px-4 max-md:pb-4 max-md:text-[15px]">
                                    <p className="m-0 [font-variation-settings:'GEOM'_25]">{a}</p>
                                </div>
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    )
}
