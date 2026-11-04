"use client"

import { useEffect, useState } from "react"

// DEV ONLY (layout.tsx renders it when NODE_ENV !== "production"). Flips Cal.com's
// `.dark` class on <html> so the port can be checked in both themes. Cal.com's site has
// its own theme switch; this file does not move over.
//
// Also honors ?theme=dark / ?theme=light in the URL.

const KEY = "fp-dev-theme"

export function ThemeToggle() {
    const [dark, setDark] = useState(false)

    // The theme script in app/layout.tsx has already set the class before first paint.
    useEffect(() => setDark(document.documentElement.classList.contains("dark")), [])

    const flip = () => {
        const next = !dark
        setDark(next)
        const root = document.documentElement
        root.classList.toggle("dark", next)
        root.style.colorScheme = next ? "dark" : "light"
        try {
            localStorage.setItem(KEY, next ? "dark" : "light")
        } catch {}
    }

    return (
        <button
            type="button"
            onClick={flip}
            data-dev-theme-toggle
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            className="fixed right-3 bottom-3 z-[9999] rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground shadow-sm"
        >
            {dark ? "Dark" : "Light"} · dev
        </button>
    )
}
