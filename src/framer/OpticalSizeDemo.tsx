"use client"

// Client boundary for components/OpticalSizeDemo.tsx (section 08, "Display to text" b).
//
// Props per Framer band, from the page module. React 19
// ignores defaultProps on function components, so every prop is passed.
//
// The hexLerp fix, without touching the component: TapeMark mixes the `color` prop toward
// the orange accent with a hex-only parser, so a CSS variable (what the live page passes)
// yields rgb(NaN, …), the ticks fall back to the inherited text color, and the orange
// never shows. Here the wrapper resolves --foreground to a hex string at runtime and
// passes that instead, re-reading it whenever the theme changes. The server render (and
// hydration) pass the variable itself, which paints the same as the resolved value until
// the effect runs; only the needle's orange waits for it.
//
// A second fix, also from outside: Row 2's size is a numeric motion value (opsz ÷ 0.75)
// bound to `fontSize`. Framer's runtime adds "px" to it; framer-motion 11 from npm does
// not (fontSize isn't in its unit table), so every update after the first render writes
// a unitless number the browser drops, and Row 2 stays at 8pt for the whole scroll. The
// wrapper watches Row 2's style (its font-variation-settings change every frame) and
// writes the same size in px. Once the component emits a px string this is a no-op.
import { useLayoutEffect, useRef, useState } from "react"
import { framerBands, useBand } from "@/lib/useBand"
import OpticalSizeDemoSource from "@components/OpticalSizeDemo"

type Band = "small" | "phone" | "tablet" | "desktop" | "large"

// Framer's band at this width. The server (and hydration) assume 1200–1919.
const BANDS = framerBands<Band>({ large: "large", desktop: "desktop", tablet: "tablet", phone: "phone" })

// Round 2: the large line is Cal.com's section-title size, 34px on phones, 44px at 810–1199,
// and 56px from 1200 (fixedSize is in points: px × 0.75). Each textWidth shrinks or grows with
// it, so the sentence keeps Framer's line breaks.
const PHONE_TEXT = "Scheduling infrastructure for~absolutely everyone"

const BASE = {
    text: "Scheduling infrastructure for absolutely everyone",
    scrollLength: 400,
    tickGap: 120,
    desktopPadding: 96,
    mobilePadding: 84,
    breakpoint: 768,
    textGap: 32,
    textWidth: 635,
    topOffset: 16,
    needlePos: 45,
    fixedSize: 42,
    label1: "fixed size · size variations highlight",
    label2: "use · automatic optical sizing feature",
    // The root is a slab the width of its content; it takes the page background so it
    // disappears in both themes.
    backgroundColor: "var(--background)",
    gradientSize: 100,
    gradientMode: "sticky",
    debug: false,
}

const PHONE = {
    breakpoint: 390,
    fixedSize: 25.5,
    mobilePadding: 0,
    text: PHONE_TEXT,
    textGap: 26,
    textWidth: 255,
    topOffset: 10,
}

const BY_BAND: Record<Band, Partial<typeof BASE>> = {
    large: {},
    desktop: { breakpoint: 770, textWidth: 625 },
    tablet: { fixedSize: 33, textGap: 20, textWidth: 440 },
    phone: PHONE,
    small: PHONE,
}

// "rgb(250, 250, 250)" / "rgba(…)" → "#fafafa". Anything else (a color() value from a
// wide-gamut token, say) returns null and the variable stays in use.
function toHex(computed: string): string | null {
    const m = computed.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/)
    if (!m) return null
    return (
        "#" +
        m
            .slice(1, 4)
            .map((v) => Math.round(Number(v)).toString(16).padStart(2, "0"))
            .join("")
    )
}

/** --foreground as a hex string, resolved where `probe` sits, kept current across theme changes. */
function useResolvedForeground(probe: React.RefObject<HTMLSpanElement | null>) {
    const [hex, setHex] = useState<string | null>(null)
    useLayoutEffect(() => {
        const read = () => {
            if (probe.current) setHex(toHex(getComputedStyle(probe.current).color))
        }
        read()
        // Cal.com switches themes with a class on <html>; also follow the OS setting in
        // case a theme script keys off it.
        const mo = new MutationObserver(read)
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
        const mq = window.matchMedia("(prefers-color-scheme: dark)")
        mq.addEventListener("change", read)
        return () => {
            mo.disconnect()
            mq.removeEventListener("change", read)
        }
    }, [probe])
    return hex
}

// Row 2 = the second specimen <p>, the one without Row 1's zero-size baseline <span>.
function useRampSizeInPx(probe: React.RefObject<HTMLSpanElement | null>) {
    useLayoutEffect(() => {
        const host = probe.current?.parentElement
        if (!host) return
        const sync = (p: HTMLElement) => {
            const m = p.style.fontVariationSettings.match(/"opsz"\s+([\d.]+)/)
            if (!m || p.querySelector("span")) return
            const px = `${(Number(m[1]) / 0.75).toFixed(3)}px`
            if (p.style.fontSize !== px) p.style.fontSize = px
        }
        const all = () => host.querySelectorAll<HTMLElement>("p").forEach(sync)
        all()
        const mo = new MutationObserver((records) => {
            for (const r of records) if (r.target instanceof HTMLParagraphElement) sync(r.target)
        })
        mo.observe(host, { attributes: true, attributeFilter: ["style"], subtree: true })
        return () => mo.disconnect()
    }, [probe])
}

export function OpticalSizeDemo() {
    const band = useBand(BANDS, "small", "desktop")
    const probe = useRef<HTMLSpanElement>(null)
    const foreground = useResolvedForeground(probe)
    useRampSizeInPx(probe)
    return (
        <>
            <span ref={probe} aria-hidden="true" style={{ display: "none", color: "var(--foreground)" }} />
            <OpticalSizeDemoSource {...BASE} {...BY_BAND[band]} color={foreground ?? "var(--foreground)"} />
        </>
    )
}
