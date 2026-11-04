import React, { useState } from "react"
import { addPropertyControls, ControlType } from "framer"

export default function CopyButton(props) {
    const { textToCopy, color, successColor, size } = props
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(textToCopy)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy!", err)
        }
    }

    return (
        <div style={containerStyle} onClick={handleCopy}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                    color: copied ? successColor : color,
                }}
            >
                {copied ? (
                    /* Matching Checkmark */
                    <path
                        fill="currentColor"
                        d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"
                    />
                ) : (
                    /* Your Requested SVG */
                    <path
                        fill="currentColor"
                        fillRule="evenodd"
                        d="M2.75.5A1.75 1.75 0 0 0 1 2.25v7.5c0 .966.784 1.75 1.75 1.75H4.5V10H2.75a.25.25 0 0 1-.25-.25v-7.5A.25.25 0 0 1 2.75 2h5.5a.25.25 0 0 1 .25.25V3H10v-.75A1.75 1.75 0 0 0 8.25.5zm5 4A1.75 1.75 0 0 0 6 6.25v7.5c0 .966.784 1.75 1.75 1.75h5.5A1.75 1.75 0 0 0 15 13.75v-7.5a1.75 1.75 0 0 0-1.75-1.75zM7.5 6.25A.25.25 0 0 1 7.75 6h5.5a.25.25 0 0 1 .25.25v7.5a.25.25 0 0 1-.25.25h-5.5a.25.25 0 0 1-.25-.25z"
                        clipRule="evenodd"
                    />
                )}
            </svg>
        </div>
    )
}

CopyButton.defaultProps = {
    textToCopy: "npm install cal-sans-ui",
    color: "#888888",
    successColor: "#FFFFFF",
    size: 16,
}

addPropertyControls(CopyButton, {
    textToCopy: { title: "Text", type: ControlType.String },
    color: { title: "Color", type: ControlType.Color },
    successColor: { title: "Success", type: ControlType.Color },
    size: { title: "Size", type: ControlType.Number, min: 12, max: 64 },
})

const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
}
