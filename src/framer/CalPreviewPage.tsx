"use client"

import { useSyncExternalStore } from "react"
import { clientOnly } from "@/lib/clientOnly"

// Client boundary for components/CalPreviewPage.tsx (section 13, UI live view).
//
// Client-only: the component injects its stylesheet in an effect, so a server render
// would paint the dashboard unstyled until hydration. Until it mounts, a box of its
// measured height holds the space (457.59px phone layout, 559.69px from 810 up).
//
// The page owns two props, as Framer's breakpoints did:
//   theme   follows Cal.com's `.dark` class on <html> ("light" | "dark")
//   mobile  below 810 (Framer's Phone and Phone Small): mobile true, card2 false

const Fallback = () => <div aria-hidden="true" className="h-[457.59px] w-full bp810:h-[559.69px]" />
const Source = clientOnly(() => import("@components/CalPreviewPage"), Fallback)

// prefers .dark on <html>, re-read whenever its class attribute changes
function subscribeTheme(cb: () => void) {
    const mo = new MutationObserver(cb)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => mo.disconnect()
}
const useHtmlTheme = () =>
    useSyncExternalStore(
        subscribeTheme,
        () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
        () => "light" as const
    )

// Framer's phone bands: ≤389 and 390–809.
const PHONE = "(max-width: 809.98px)"
function subscribePhone(cb: () => void) {
    const mq = matchMedia(PHONE)
    mq.addEventListener("change", cb)
    return () => mq.removeEventListener("change", cb)
}
const usePhone = () => useSyncExternalStore(subscribePhone, () => matchMedia(PHONE).matches, () => false)

type Props = {
    geom: number
    card1: boolean
    card3: boolean
    card4: boolean
    card5: boolean
    avatar1: string
    avatar2: string
}

export function CalPreviewPage(props: Props) {
    const theme = useHtmlTheme()
    const phone = usePhone()
    return (
        // While the component's stylesheet (#calpp-styles, injected by its own effect) is
        // missing, keep the box at its styled height and the dashboard invisible.
        // The dashboard CSS leaves some sizes to inheritance: Framer's code-component
        // container gives it 12px and line-height normal (the page has 16px / 1.5).
        <div className="w-full text-[12px] leading-[normal] [html:not(:has(#calpp-styles))_&]:h-[457.59px] [html:not(:has(#calpp-styles))_&]:overflow-clip [html:not(:has(#calpp-styles))_&]:invisible bp810:[html:not(:has(#calpp-styles))_&]:h-[559.69px]">
            {/* font: "full" (the default): Cal Sans 2.011, not the coss ui build. */}
            <Source {...props} font="full" theme={theme} mobile={phone} card2={!phone} />
        </div>
    )
}
