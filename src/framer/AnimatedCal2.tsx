"use client"

// Client boundary for components/AnimatedCal2.tsx (the Hero).
//
// AnimatedCal2 draws its holographic sticker with WebGL, so it never renders on the
// server: clientOnly() (next/dynamic, ssr: false). The server sends a still of the word, so the
// Hero is never blank and nothing moves when the component takes over.
//
// Framer gives the instance a different prop set per breakpoint (`lines`, the violator
// sticker's position, scale and outline, the hint's scale). AnimatedCal2ByBand picks
// the set for the current band with the same edges as Framer: 390, 810, 1200, 1920.
import { useEffect, useState, type ComponentType } from "react"
import { clientOnly } from "@/lib/clientOnly"
import { framerBands, useBand } from "@/lib/useBand"
import styles from "@/sections/01-hero.module.css"

// The word, as plain text at the component's own size, until the component is ready. The
// component starts at its widest size (compWidth 1649, so 325px type) and measures itself in an
// effect, which painted one giant, clipped frame. Its size formula is in the module CSS.
function HeroStill() {
    return (
        <div aria-hidden data-hero-still="" className={styles.still}>
            <span>
                Cal
                <br className="bp810:hidden" /> Sans
            </span>
        </div>
    )
}

// React 19 ignores defaultProps on function components, so the component's own defaults
// are spread under the props here (the instance props still win).
type AnyProps = Record<string, unknown>
export const AnimatedCal2 = clientOnly<AnyProps>(
    () =>
        import("@components/AnimatedCal2").then((m): { default: ComponentType<AnyProps> } => {
            const Source = m.default as ComponentType<AnyProps> & { defaultProps?: AnyProps }
            const defaults = Source.defaultProps ?? {}
            return {
                default: function Ready(props: AnyProps) {
                    // The still stays up, and the component stays hidden (module CSS), for the few
                    // frames it takes to measure.
                    const [ready, setReady] = useState(false)
                    useEffect(() => {
                        let id = 0
                        let left = 3
                        const tick = () => {
                            if (--left <= 0) setReady(true)
                            else id = requestAnimationFrame(tick)
                        }
                        id = requestAnimationFrame(tick)
                        return () => cancelAnimationFrame(id)
                    }, [])
                    return (
                        <>
                            {ready ? null : <HeroStill />}
                            <Source {...defaults} {...props} />
                        </>
                    )
                },
            }
        }),
    HeroStill
)

// ── Framer's breakpoint bands ────────────────────────────────────────────────────────
type Band = "389" | "390" | "810" | "1200" | "1920"
const BANDS = framerBands<Band>({ large: "1920", desktop: "1200", tablet: "810", phone: "390" })

type Props = Record<string, unknown>

/** `base` is the ≥1920 prop set; `bands` holds each band's overrides (Framer's `overrides`). */
export function AnimatedCal2ByBand({ base, bands }: { base: Props; bands: Partial<Record<Band, Props>> }) {
    const band = useBand(BANDS, "389", "1920")
    return <AnimatedCal2 {...base} {...bands[band]} />
}
