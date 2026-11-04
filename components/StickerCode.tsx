import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"

/**
 * @framerIntrinsicWidth 1440
 * @framerIntrinsicHeight 520
 */

// Font-version machinery lives in Shared.tsx (Phase 2). Re-Copy-Import after any
// Shared edit — the @<hash> in the URL is a version pin.
import {
    calFont,
    FONT_CONTROLS,
    buildFontFaceCSS,
    readFontRevision,
} from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"

function mulberry32(seed: number) {
    let t = seed >>> 0
    return function () {
        t += 0x6d2b79f5
        let r = Math.imul(t ^ (t >>> 15), 1 | t)
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296
    }
}

export default function StickerCard(props) {
    const {
        textA,
        textB,
        textC,
        stickerBg,
        textColor,
        totalCount,
        duration,
        bleedAmount,
        jitter,
        fontSize,
        borderRadius,
        backgroundColor,
        seed,
        once,
        debug,
    } = props

    const ver = calFont(props)

    const [size, setSize] = React.useState({ w: 0, h: 0 })
    const containerRef = React.useRef(null)

    // Version badge state — what the loaded BINARY actually reports.
    const [probe, setProbe] = React.useState("…")
    const [loaded, setLoaded] = React.useState(false)

    React.useEffect(() => {
        if (!containerRef.current) return
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setSize({
                    w: entry.contentRect.width,
                    h: entry.contentRect.height,
                })
            }
        })
        observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    React.useEffect(() => {
        let alive = true
        setProbe("probing…")
        readFontRevision(ver.url).then((r) => alive && setProbe(r))
        const face = `700 24px "${ver.family}"`
        const check = () => alive && setLoaded(document.fonts.check(face))
        check()
        document.fonts.ready.then(check)
        return () => {
            alive = false
        }
    }, [ver.family, ver.url])

    const stickers = React.useMemo(() => {
        const rand = mulberry32(seed)
        const textOptions = [textA, textB, textC].filter((t) => t !== "")
        if (textOptions.length === 0) return []

        const n = totalCount
        const minRange = -bleedAmount
        const maxRange = 100 + bleedAmount
        const span = maxRange - minRange

        // JITTERED GRID: pure random clumps (gaps until you massively overfill), so
        // lay stickers on a grid sized to the count + card aspect (cells ≈ square in
        // px), then jitter each off its cell centre for an organic, even scatter.
        const aspect = size.w && size.h ? size.w / size.h : 1440 / 520
        const cols = Math.max(1, Math.round(Math.sqrt(n * aspect)))
        const rows = Math.max(1, Math.ceil(n / cols))
        const cellW = span / cols
        const cellH = span / rows

        const arr = []
        for (let i = 0; i < n; i++) {
            const col = i % cols
            const row = Math.floor(i / cols)
            // jitter is a fraction of a cell; ±jitter/2 keeps most stickers in-cell.
            const jx = (rand() - 0.5) * jitter
            const jy = (rand() - 0.5) * jitter
            arr.push({
                id: i,
                content: textOptions[Math.floor(rand() * textOptions.length)],
                left: `${minRange + (col + 0.5 + jx) * cellW}%`,
                top: `${minRange + (row + 0.5 + jy) * cellH}%`,
                rotate: rand() * 40 - 20,
                delay: 0,
            })
        }

        // Random reveal cascade: eased delays assigned in SHUFFLED order, so it doesn't
        // sweep the grid row-by-row (Fisher–Yates with the same seeded rand).
        const delays = arr.map((_, i) => {
            const x = n > 1 ? i / (n - 1) : 0
            return ((Math.pow(2 * x - 1, 3) + 1) / 2) * duration
        })
        for (let i = delays.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1))
            ;[delays[i], delays[j]] = [delays[j], delays[i]]
        }
        arr.forEach((s, i) => (s.delay = delays[i]))

        return arr
    }, [
        textA,
        textB,
        textC,
        totalCount,
        duration,
        bleedAmount,
        jitter,
        seed,
        size.w,
        size.h,
    ])

    return (
        <div
            ref={containerRef}
            style={{
                ...cardStyle,
                backgroundColor: backgroundColor || "#FFFFFF",
            }}
        >
            <style dangerouslySetInnerHTML={{ __html: buildFontFaceCSS(ver) }} />

            {stickers.map((s) => (
                <motion.div
                    key={`${s.id}-${size.w}-${seed}`}
                    initial={{
                        opacity: 0,
                        scale: 0,
                        x: "-50%",
                        y: "-50%",
                        rotate: s.rotate,
                    }}
                    whileInView={{
                        opacity: 1,
                        scale: 1,
                        x: "-50%",
                        y: "-50%",
                        rotate: s.rotate,
                    }}
                    viewport={{ once: once, amount: 0.2 }}
                    transition={{
                        delay: s.delay,
                        type: "spring",
                        stiffness: 400,
                        damping: 24,
                    }}
                    style={{
                        position: "absolute",
                        left: s.left,
                        top: s.top,
                        backgroundColor: stickerBg,
                        color: textColor,
                        padding: "10px 24px",
                        borderRadius: `${borderRadius}px`,
                        fontSize: `${fontSize}px`,
                        fontWeight: 700,
                        fontFamily: `"${ver.family}", sans-serif`,
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        zIndex: s.id,
                    }}
                >
                    {s.content}
                </motion.div>
            ))}

            {debug && (
                <div style={badgeStyle}>
                    <div style={{ fontWeight: 700 }}>Version report</div>
                    <div>
                        binary: {probe}
                    </div>
                    <div>face loaded: {loaded ? "✓" : "✗"}</div>
                </div>
            )}
        </div>
    )
}

StickerCard.defaultProps = {
    textA: "The Bomb",
    textB: "Explosion",
    textC: "Banger",
    stickerBg: "#B5D6E1",
    textColor: "#000000",
    totalCount: 80,
    duration: 2.5,
    bleedAmount: 10,
    jitter: 0.9,
    fontSize: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    seed: 42,
    once: true,
    debug: false,
}

addPropertyControls(StickerCard, {
    ...FONT_CONTROLS,
    textA: { type: ControlType.String, title: "Text A" },
    textB: { type: ControlType.String, title: "Text B" },
    textC: { type: ControlType.String, title: "Text C" },
    stickerBg: { type: ControlType.Color, title: "Sticker" },
    textColor: { type: ControlType.Color, title: "Text Color" },
    backgroundColor: { type: ControlType.Color, title: "Card BG" },
    totalCount: { type: ControlType.Number, title: "Count", min: 1, max: 500 },
    fontSize: { type: ControlType.Number, title: "Font Size", min: 8 },
    duration: {
        type: ControlType.Number,
        title: "Stagger",
        min: 0.1,
        step: 0.1,
    },
    bleedAmount: {
        type: ControlType.Number,
        title: "Edge Bleed %",
        min: 0,
        max: 30,
    },
    jitter: {
        type: ControlType.Number,
        title: "Jitter",
        min: 0,
        max: 1.5,
        step: 0.05,
    },
    seed: { type: ControlType.Number, title: "Shuffle", min: 1, max: 999 },
    once: { type: ControlType.Boolean, title: "Animate Once" },
    debug: { type: ControlType.Boolean, title: "Debug Badge" },
})

const cardStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    display: "block",
    borderRadius: "12px",
    border: "1px solid #E1E2E3",
    boxShadow: "0px 1px 10px -4px rgba(36, 36, 36, 0.70)",
}

const badgeStyle: React.CSSProperties = {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 99999,
    background: "rgba(20,20,20,0.85)",
    color: "#E6FF7A",
    font: '11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace',
    padding: "8px 10px",
    borderRadius: 8,
    pointerEvents: "none",
    whiteSpace: "pre",
}
