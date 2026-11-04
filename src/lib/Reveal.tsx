"use client"

import { useEffect } from "react"

// "Fade in the next block", copied from Cal.com's new site (cal-staging.com, 2026-11-03).
// There, each section is wrapped in `useArrived("30%")`: an IntersectionObserver with
// rootMargin "0px 0px -30% 0px" that sets `data-in` once, when the element's top crosses
// 70% of the viewport height, and never takes it back. The section's blocks carry their
// `reveal` class: from 24px low and transparent, to in place, over 1s on
// --ease-hp (cubic-bezier(.19, 1, .22, 1)), each delayed --i × 100ms. Reduced motion
// shows everything at once.
//
// Here the sections are Framer ports, so instead of editing 23 files this finds the
// blocks itself. In each `.page-content > section`, it walks down while a wrapper has a
// single child, and the children of the first wrapper with several are the blocks (a
// wrapper with more than MAX_BLOCKS children, such as a glyph grid, is one block). Each
// block is observed on its own, so tall sections reveal row by row as on staging's long
// pages, and blocks that arrive in the same frame stagger by 100ms.
//
// A wrapper can opt in to having every child reveal alone, however many it has, with its own
// shorter stagger: `data-reveal-each="50"` (ms). The typing cards in section 16 use this.
//
// Sections already on screen when the page loads are left alone: only blocks the reader
// scrolls to fade in. Nothing is hidden before this runs, so the page still reads
// without JavaScript.
//
// Blocks that already use transform or translate (centered absolutes, Framer layout) only
// fade, so their position is never overridden. The CSS is in globals.css (`[data-reveal]`).

const LINE = "30%"
const MAX_BLOCKS = 8

function blocksOf(section: Element): HTMLElement[] {
    let node: Element = section
    while (node.children.length === 1) node = node.children[0]
    const kids = Array.from(node.children).filter(
        (k): k is HTMLElement => k instanceof HTMLElement && getComputedStyle(k).display !== "none"
    )
    if (node instanceof HTMLElement && node.dataset.revealEach) return kids
    if (kids.length === 0) return node instanceof HTMLElement ? [node] : []
    if (kids.length > MAX_BLOCKS) return node instanceof HTMLElement ? [node] : kids.slice(0, 1)
    return kids
}

function moved(el: HTMLElement) {
    const cs = getComputedStyle(el)
    return cs.transform !== "none" || (cs.translate !== "none" && cs.translate !== "0px")
}

export function Reveal() {
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        const targets: HTMLElement[] = []
        for (const section of document.querySelectorAll(".page-content > section")) {
            // Anything already on screen at load stays put: hiding it here would flash it away.
            if (section.getBoundingClientRect().top < window.innerHeight) continue
            for (const block of blocksOf(section)) {
                block.dataset.reveal = moved(block) ? "fade" : "rise"
                targets.push(block)
            }
        }
        if (targets.length === 0) return

        const io = new IntersectionObserver(
            (entries) => {
                let i = 0
                for (const e of entries) {
                    if (!e.isIntersecting) continue
                    const el = e.target as HTMLElement
                    const step = Number(el.parentElement?.dataset.revealEach) || 100
                    const delay = i * step
                    el.style.setProperty("--i", String(i++))
                    el.style.setProperty("--reveal-step", `${step}ms`)
                    el.dataset.in = ""
                    io.unobserve(el)
                    // Hand the block back untouched once it's in place.
                    window.setTimeout(() => {
                        delete el.dataset.reveal
                        delete el.dataset.in
                        el.style.removeProperty("--i")
                        el.style.removeProperty("--reveal-step")
                    }, 1000 + delay + 50)
                }
            },
            { rootMargin: `0px 0px -${LINE} 0px` }
        )
        targets.forEach((t) => io.observe(t))
        return () => io.disconnect()
    }, [])
    return null
}
