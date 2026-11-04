import React, { useEffect, useState } from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import {
    CAL_SANS,
    buildFontFaceCSS,
    readFontRevision,
} from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"

const injectStyles = (ver) => {
    if (typeof document === "undefined") return
    const id = "calsans-label-styles"
    let style = document.getElementById(id)

    if (!style) {
        style = document.createElement("style")
        style.id = id
        document.head.appendChild(style)
    }

    style.innerHTML = `
        ${buildFontFaceCSS(ver)}

        .calsans-labels {
            font-family: "${ver.family}", -apple-system, BlinkMacSystemFont, sans-serif !important;
            font-size: 14px !important;
            line-height: 16px !important;
            font-weight: 500;
            text-align: center;
            margin: 0;
            padding: 0;
            letter-spacing: 0px !important;
            -webkit-font-smoothing: antialiased;
            text-transform: lowercase;
            white-space: nowrap;
        }
    `
}

export default function VariableMorph2(props) {
    const {
        fontFamily,
        fontSize,
        text,
        duration,
        opszValue,
        label0,
        label50,
        label100,
        labelOffset,
        debug,
    } = props

    const ver = CAL_SANS

    // Version-debug probe (badge): reads the build from the rendered binary.
    const [probe, setProbe] = useState("…")
    const [faceLoaded, setFaceLoaded] = useState(false)
    useEffect(() => {
        injectStyles(ver)
        let alive = true
        if (debug) {
            setProbe("probing…")
            readFontRevision(ver.url).then((r) => alive && setProbe(r))
            const face = `700 24px "${ver.family}"`
            const check = () =>
                alive && setFaceLoaded(document.fonts.check(face))
            check()
            document.fonts.ready.then(check)
        }
        return () => {
            alive = false
        }
    }, [ver.family, debug])

    const progressMV = useMotionValue(0)
    const morfMV = useMotionValue(0)

    useEffect(() => {
        const controls = animate(0, 1, {
            duration: duration,
            ease: "linear", // Keep master loop linear to manage the custom timeline
            repeat: Infinity,
            onUpdate: (latest) => {
                progressMV.set(latest)

                // Pacing: Holds at 0, 0.3, 0.6. Transitions at 0.15, 0.45, 0.75
                const times = [0, 0.2, 0.35, 0.55, 0.7, 0.9, 1]
                const values = [0, 0, 50, 50, 100, 100, 0]

                for (let i = 0; i < times.length - 1; i++) {
                    if (latest >= times[i] && latest <= times[i + 1]) {
                        // Apply a strong Ease In Out (Cubic) to the internal transition 't'
                        let t = (latest - times[i]) / (times[i + 1] - times[i])
                        const easedT =
                            t < 0.5
                                ? 4 * t * t * t
                                : 1 - Math.pow(-2 * t + 2, 3) / 2

                        let val =
                            values[i] + easedT * (values[i + 1] - values[i])
                        morfMV.set(val)
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

    // Syncing ss01/ss02 opacities to the new holds
    const ss01Opacity = useTransform(
        progressMV,
        [0, 0.19, 0.2, 0.54, 0.55, 1],
        [0, 0, 1, 1, 0, 0]
    )
    const ss02Opacity = useTransform(
        progressMV,
        [0, 0.54, 0.55, 0.89, 0.9, 1],
        [0, 0, 1, 1, 0, 0]
    )

    // Snappy Color Logic mapped to progress holds
    const color0 = useTransform(
        progressMV,
        [0, 0.2, 0.21, 0.99, 1],
        ["#242424", "#242424", "#A1A1A1", "#A1A1A1", "#242424"]
    )
    const color50 = useTransform(
        progressMV,
        [0.21, 0.22, 0.55, 0.56],
        ["#A1A1A1", "#242424", "#242424", "#A1A1A1"]
    )
    const color100 = useTransform(
        progressMV,
        [0.57, 0.58, 0.9, 0.91],
        ["#A1A1A1", "#242424", "#242424", "#A1A1A1"]
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
        fontFamily: `"${fontFamily}", sans-serif`,
        fontSize: fontSize,
        lineHeight: 1,
        WebkitFontSmoothing: "antialiased",
        pointerEvents: "none",
        whiteSpace: "nowrap",
    }

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "visible",
            }}
        >
            <motion.div
                style={{
                    ...layerStyle,
                    color: "#242424",
                    zIndex: 1,
                    fontOpticalSizing: "none", // explicit opsz below; WebKit drops opsz = default and auto-sizes over it
                    fontVariationSettings: fontVars,
                }}
            >
                {text}
            </motion.div>
            <motion.div
                style={{
                    ...layerStyle,
                    color: "#A1A1A1",
                    zIndex: 2,
                    fontFeatureSettings: '"ss02" on',
                    fontOpticalSizing: "none", // explicit opsz below; WebKit drops opsz = default and auto-sizes over it
                    fontVariationSettings: fontVars,
                    opacity: ss02Opacity,
                }}
            >
                {text}
            </motion.div>
            <motion.div
                style={{
                    ...layerStyle,
                    color: "#A1A1A1",
                    zIndex: 3,
                    fontFeatureSettings: '"ss01" on',
                    fontOpticalSizing: "none", // explicit opsz below; WebKit drops opsz = default and auto-sizes over it
                    fontVariationSettings: fontVars,
                    opacity: ss01Opacity,
                }}
            >
                {text}
            </motion.div>

            <div
                style={{
                    position: "absolute",
                    top: "100%",
                    marginTop: labelOffset,
                    left: 0,
                    right: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                }}
            >
                <motion.p className="calsans-labels" style={{ color: color0 }}>
                    {label0}
                </motion.p>
                <motion.p className="calsans-labels" style={{ color: color50 }}>
                    {label50}
                </motion.p>
                <motion.p
                    className="calsans-labels"
                    style={{ color: color100 }}
                >
                    {label100}
                </motion.p>
            </div>

            {debug && (
                <div style={versionBadgeStyle}>
                    <div style={{ fontWeight: 700 }}>Version report</div>
                    <div>
                        binary: {probe}
                    </div>
                    <div>face loaded: {faceLoaded ? "✓" : "✗"}</div>
                </div>
            )}
        </div>
    )
}

const versionBadgeStyle: React.CSSProperties = {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 99999,
    background: "rgba(20,20,20,0.85)",
    color: "#E6FF7A",
    font: "11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace",
    padding: "8px 10px",
    borderRadius: 8,
    pointerEvents: "none",
    whiteSpace: "pre",
}

VariableMorph2.defaultProps = {
    text: "Cal.com",
    fontSize: 200,
    fontFamily: "Cal Anim Graph 6 [MORF,opsz] Variable Regular",
    duration: 5,
    opszValue: 300,
    label0: "original branding face",
    label50: "legible spaces",
    label100: "lowered x-height",
    labelOffset: 120,
    debug: false,
}

addPropertyControls(VariableMorph2, {
    text: { type: ControlType.String, title: "Text" },
    fontSize: { type: ControlType.Number, title: "Size", min: 10, max: 1000 },
    duration: { type: ControlType.Number, title: "Duration", min: 1, max: 20 },
    opszValue: {
        type: ControlType.Number,
        title: "Optical Size",
        min: 80,
        max: 300,
        step: 1,
    },
    label0: { type: ControlType.String, title: "Label 1" },
    label50: { type: ControlType.String, title: "Label 2" },
    label100: { type: ControlType.String, title: "Label 3" },
    labelOffset: {
        type: ControlType.Number,
        title: "Label Offset",
        min: 0,
        max: 1000,
    },
    debug: {
        type: ControlType.Boolean,
        title: "Debug Badge",
        defaultValue: false,
    },
})
