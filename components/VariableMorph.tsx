import React, { useEffect } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

// Baked font name — Framer serves it via a native layer; its picker shows the short
// name but the CSS family needs the " Variable Regular" suffix. Edit here if it changes.
const FONT_FAMILY = "Cal Anim Graph 6 [MORF,opsz] Variable Regular"

export default function VariableMorph(props) {
    const { fontSize, glyph, opszValue, duration } = props

    // Animate MORF 0 → 100 → 0 with a hold at each end (easy-ease per leg). opsz is a
    // static prop mixed in via useTransform, so changing it never restarts the loop —
    // and there's no window-resize hack, so nothing hitches while you resize.
    const morfMV = useMotionValue(0)
    useEffect(() => {
        // Master loop is linear 0→1; each segment eases manually inside onUpdate — the
        // same proven pattern as VariableMorph2. (Animating a keyframe array directly on
        // the motion value was flaky in Framer's framer-motion.)
        const times = [0, 0.15, 0.5, 0.65, 1]
        const values = [0, 0, 100, 100, 0] // hold, up, hold, down
        const controls = animate(0, 1, {
            duration,
            ease: "linear",
            repeat: Infinity,
            onUpdate: (latest) => {
                for (let i = 0; i < times.length - 1; i++) {
                    if (latest >= times[i] && latest <= times[i + 1]) {
                        const t =
                            (latest - times[i]) / (times[i + 1] - times[i])
                        const easedT =
                            t < 0.5
                                ? 4 * t * t * t
                                : 1 - Math.pow(-2 * t + 2, 3) / 2
                        morfMV.set(
                            values[i] + easedT * (values[i + 1] - values[i])
                        )
                        break
                    }
                }
            },
        })
        return () => controls.stop()
    }, [duration])

    const fontVars = useTransform(
        morfMV,
        (m) => `'MORF' ${Math.round(m)}, 'opsz' ${opszValue}`
    )

    const layerStyle: React.CSSProperties = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: `"${FONT_FAMILY}", sans-serif`,
        fontSize: fontSize,
        lineHeight: 1,
        WebkitFontSmoothing: "antialiased",
        pointerEvents: "none",
        whiteSpace: "nowrap",
    }

    // Three stacked forms (ss01 / ss02 / default), all morphing together.
    const layers = [
        { color: "#242424", feat: '"ss01" on', z: 3 },
        { color: "#898989", feat: '"ss02" on', z: 2 },
        { color: "#242424", feat: "normal", z: 1 },
    ]

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "visible",
            }}
        >
            {layers.map((layer, index) => (
                <motion.div
                    key={index}
                    style={{
                        ...layerStyle,
                        color: layer.color,
                        zIndex: layer.z,
                        fontVariantLigatures: "none",
                        fontOpticalSizing: "none", // explicit opsz below; WebKit drops opsz = default and auto-sizes over it
                        fontVariationSettings: fontVars,
                        fontFeatureSettings: layer.feat,
                    }}
                >
                    {glyph}
                </motion.div>
            ))}
        </div>
    )
}

VariableMorph.defaultProps = {
    glyph: "a",
    fontSize: 300,
    opszValue: 300,
    duration: 3,
}

addPropertyControls(VariableMorph, {
    glyph: { type: ControlType.String, title: "Glyph" },
    fontSize: { type: ControlType.Number, title: "Size", min: 10, max: 1000 },
    opszValue: {
        type: ControlType.Number,
        title: "Optical Size",
        min: 80,
        max: 300,
        step: 1,
    },
    duration: {
        type: ControlType.Number,
        title: "Duration",
        min: 1,
        max: 20,
        step: 0.1,
    },
})
