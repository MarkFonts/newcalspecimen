import { useCallback, useMemo, useSyncExternalStore } from "react"

// One breakpoint hook for the Framer wrappers in src/framer/. Each wrapper lists its bands
// as [label, media query] pairs, widest first; the first query that matches wins, and
// `fallback` is the band when none does. The label is whatever the wrapper indexes its
// per-band props with: a name ("1920", "desktop") or an index (4 … 0).
//
//   const BANDS = framerBands({ large: "1920", desktop: "1200", tablet: "810", phone: "390" })
//   const band = useBand(BANDS, "389", "1920")
//
// `server` is the band the server render, and hydration, assume. It decides what the first
// render does, so each wrapper keeps the one it always had. Leave it out for a component
// that only ever renders in the browser (clientOnly, ssr: false): the first render then
// reads the real band.
//
// Pass a module-level `bands` array, never one built inside the component: the
// subscription is rebuilt when the array changes.

export type BandQuery<L> = readonly [label: L, query: string]

export const minWidth = (px: number) => `(min-width: ${px}px)`

/** Framer's four edges, widest first: ≥1920, ≥1200, ≥810, ≥390. Below 390 is the fallback. */
export function framerBands<L>(labels: { large: L; desktop: L; tablet: L; phone: L }): BandQuery<L>[] {
    return [
        [labels.large, minWidth(1920)],
        [labels.desktop, minWidth(1200)],
        [labels.tablet, minWidth(810)],
        [labels.phone, minWidth(390)],
    ]
}

export function useBand<L extends string | number>(bands: readonly BandQuery<L>[], fallback: L, server?: L): L {
    const read = useCallback((): L => {
        for (const [label, query] of bands) if (window.matchMedia(query).matches) return label
        return fallback
    }, [bands, fallback])
    const subscribe = useCallback(
        (onChange: () => void) => {
            const lists = bands.map(([, query]) => window.matchMedia(query))
            lists.forEach((l) => l.addEventListener("change", onChange))
            return () => lists.forEach((l) => l.removeEventListener("change", onChange))
        },
        [bands]
    )
    const readServer = useMemo(() => (server === undefined ? read : () => server), [read, server])
    return useSyncExternalStore(subscribe, read, readServer)
}
