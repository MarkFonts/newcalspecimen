import type { ReactNode } from "react"

// The root of a section: one <section id=… data-framer-name=…> and the classes every
// section shares. A server component that adds no element of its own: src/lib/Reveal.tsx
// walks down single-child wrappers to find a section's blocks, so the depth inside a
// section must not change.
//
// Shared (globals.css): page-measure, or page-wide with `wide`; section-y; and section-shell,
// which centers a flex row with a 10px gap and clips overflow. `className` carries what
// differs: flex-col for a column, overflow-visible where a section must not clip, a
// different gap, z-index. Utilities beat section-shell, since it lives in the components layer.
//
// Not used by 03, 04, and 20 (a fixed-height card, the sticky stack, and a single card with
// no gap or clip) or by 24 (Cal.com's own FAQ, which has no data-framer-name).
type Props = {
    id: string
    /** Framer's layer name, kept as data-framer-name. */
    framerName: string
    /** The 1801px full-width shell (page-wide) instead of the 1320px page-measure. */
    wide?: boolean
    className?: string
    children: ReactNode
}

export function Section({ id, framerName, wide = false, className = "", children }: Props) {
    return (
        <section
            id={id}
            data-framer-name={framerName}
            className={`${wide ? "page-wide" : "page-measure"} section-y section-shell ${className}`.trim()}
        >
            {children}
        </section>
    )
}

// The inner column of the text-over-demo sections (05 to 10): heading and copy, then the demo,
// stacked and centered, with Framer's 20 / 32 / 24px gap and 20 / 32 / 64px padding.
export const SECTION_STACK =
    "relative flex w-full flex-col items-center justify-center gap-5 py-5 bp810:gap-8 bp810:py-8 bp1200:gap-6 bp1200:py-16"
