"use client"

// The three ways as Cal.com's homepage shows its steps: rows on one side, the open one with its
// caption, and one stage beside them. The open row draws a progress stroke, and the next row
// opens when it finishes, so the stroke's CSS pause (hover, keyboard focus, off screen) is the
// advance's pause. Picking a row removes the stroke and stops the advance for good. Reduced
// motion never advances. All three specimens stay mounted and crossfade, so their shared clock
// keeps running.
//
// The height never changes as rows open and close: invisible copies of the list, one per open
// row, share a grid cell with the real list, so the tallest sets the height for every state.
// Styles are in 12-open-source-b.module.css.
import { useEffect, useRef, useState, type ReactNode } from "react"
import { CalThreeWaysCard, type Way } from "@/framer/CalThreeWaysCard"
import styles from "@/sections/12-open-source-b.module.css"

const TITLE_FVS = { fontVariationSettings: '"wght" 700, "GEOM" 50' }
const BODY_FVS = { fontVariationSettings: "var(--fvs-lede)" }

type Item = { label: ReactNode; way: Way; caption: ReactNode }

function Rows({
    items,
    active,
    onPick,
    onDone,
    className,
}: {
    items: Item[]
    active: number
    onPick?: (i: number) => void
    onDone?: () => void
    className: string
}) {
    return (
        <ol className={className} aria-hidden={onPick ? undefined : true} inert={onPick ? undefined : true}>
            {items.map((item, i) => (
                <li key={item.way} className={styles.tab} data-open={i === active ? "" : undefined} aria-current={i === active ? "step" : undefined}>
                    {i === active && onDone ? <span aria-hidden className={styles.tabProgress} onAnimationEnd={onDone} /> : null}
                    <button type="button" className={styles.tabTitle} style={TITLE_FVS} aria-expanded={i === active} onClick={() => onPick?.(i)}>
                        {item.label}
                    </button>
                    <div className={styles.tabBody} style={BODY_FVS} inert={i !== active}>
                        <div>
                            <p>{item.caption}</p>
                        </div>
                    </div>
                </li>
            ))}
        </ol>
    )
}

export function ThreeWaysTabs({ intro, items }: { intro: ReactNode; items: Item[] }) {
    const [active, setActive] = useState(0)
    const [picked, setPicked] = useState(false)
    const [onScreen, setOnScreen] = useState(false)
    const [reduced, setReduced] = useState(true)
    const root = useRef<HTMLDivElement>(null)

    useEffect(() => setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches), [])

    useEffect(() => {
        if (!root.current) return
        const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.3 })
        io.observe(root.current)
        return () => io.disconnect()
    }, [])

    return (
        <div
            ref={root}
            className={styles.tabs}
            data-offscreen={onScreen ? undefined : ""}
        >
            <div className={styles.tabIntro}>{intro}</div>
            <div className={styles.tabStage}>
                {items.map((item, i) => (
                    <div key={item.way} className={`text-foreground ${styles.ways}`} data-open={i === active ? "" : undefined} aria-hidden={i !== active}>
                        <CalThreeWaysCard way={item.way} />
                    </div>
                ))}
            </div>
            <div className={styles.tabRows}>
                {items.map((item, i) => (
                    <Rows key={item.way} items={items} active={i} className={styles.tabSizer} />
                ))}
                <Rows
                    items={items}
                    active={active}
                    className={styles.tabList}
                    onDone={picked || reduced ? undefined : () => setActive((i) => (i + 1) % items.length)}
                    onPick={(i) => {
                        setActive(i)
                        setPicked(true)
                    }}
                />
            </div>
        </div>
    )
}
