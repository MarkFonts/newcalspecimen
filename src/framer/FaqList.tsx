"use client"

// Framer's FAQ list (`framer-NbWYO`) and its item (`FAQ Item 2`, `framer-kaZf5`), the
// right column of Info. These are Framer design components, not code
// components, so they are rebuilt here natively: the section (a server component)
// passes the questions and answers as JSX.
//
// Behavior, exactly as Framer's: everything closed on load; opening one item closes the
// others; tapping the open item closes it. One spring for every change, Framer's
// {bounce 0.2, duration 0.4}: the answer's height (1px ⇄ auto) and opacity, the 24px
// gap above it, and the plus turning 45° into an ×.
//
// The whole item is the tap target, as in Framer, and the question is a real <button>
// (aria-expanded/aria-controls) for the keyboard; a click on a link in an answer
// follows the link and leaves the item open.
import { useId, useState, type MouseEvent, type ReactNode } from "react"
import { motion, MotionConfig } from "framer-motion"

const SPRING = { type: "spring", bounce: 0.2, duration: 0.4, delay: 0 } as const

export type FaqEntry = { question: string; answer: ReactNode }

export function FaqList({ items }: { items: FaqEntry[] }) {
    const [open, setOpen] = useState<number | null>(null)
    return (
        <MotionConfig transition={SPRING} reducedMotion="user">
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
                {items.map((item, i) => (
                    <FaqItem
                        key={i}
                        {...item}
                        open={open === i}
                        onToggle={() => setOpen((o) => (o === i ? null : i))}
                    />
                ))}
            </div>
        </MotionConfig>
    )
}

function Plus() {
    // A plus icon, filled with the text color.
    return (
        <svg viewBox="0 0 24 24" className="size-6 shrink-0" aria-hidden="true">
            <path
                d="M 12 6 C 12.414 6 12.75 6.336 12.75 6.75 L 12.75 11.25 L 17.25 11.25 C 17.664 11.25 18 11.586 18 12 C 18 12.414 17.664 12.75 17.25 12.75 L 12.75 12.75 L 12.75 17.25 C 12.75 17.664 12.414 18 12 18 C 11.586 18 11.25 17.664 11.25 17.25 L 11.25 12.75 L 6.75 12.75 C 6.336 12.75 6 12.414 6 12 C 6 11.586 6.336 11.25 6.75 11.25 L 11.25 11.25 L 11.25 6.75 C 11.25 6.336 11.586 6 12 6 Z"
                fill="currentColor"
            />
        </svg>
    )
}

function FaqItem({ question, answer, open, onToggle }: FaqEntry & { open: boolean; onToggle: () => void }) {
    const id = useId()
    const onClick = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest("a")) return
        onToggle()
    }
    return (
        <div
            data-framer-name={open ? "Open" : "Closed"}
            onClick={onClick}
            className="relative flex w-full cursor-pointer flex-col items-center justify-center gap-[26px] overflow-hidden pt-[26px]"
        >
            {/* FAQ Wrapper */}
            <div className="relative flex w-full flex-none flex-col items-center justify-center">
                {/* Question Wrapper */}
                <h2 className="w-full">
                    <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={id}
                        className="relative flex w-full cursor-pointer items-center justify-center gap-4 overflow-hidden text-left text-subhead text-held"
                    >
                        <span className="relative w-px flex-[1_0_0] break-words">{question}</span>
                        <motion.span
                            className="relative flex flex-none flex-col items-center justify-center overflow-hidden"
                            initial={false}
                            animate={{ rotate: open ? 45 : 0 }}
                        >
                            <Plus />
                        </motion.span>
                    </button>
                </h2>
                {/* Answer Wrapper: Closed is height 1px, opacity 0, no gap above. */}
                <motion.div
                    id={id}
                    role="region"
                    inert={!open}
                    className="relative flex w-full flex-none items-center justify-center overflow-hidden"
                    initial={false}
                    animate={{ height: open ? "auto" : 1, opacity: open ? 1 : 0, marginTop: open ? 24 : 0 }}
                >
                    <div className="relative w-px flex-[1_0_0] break-words">{answer}</div>
                </motion.div>
            </div>
            {/* Line */}
            <div className="relative h-px w-full flex-none bg-border" />
        </div>
    )
}
