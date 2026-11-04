import React, { useState, useEffect, useMemo, useCallback } from "react"
import {
    CAL_SANS,
    buildFontFaceCSS,
    GEOM_PRESET_LIST,
    WEIGHTS,
} from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"
// Shared header controls (V/h/I, dropdowns, radii). Re-Copy-Import from SharedTester's
// ••• menu after editing it — the @<hash> pins the version.
import {
    AxisToggles,
    GeomToggle,
    ChevronSelect,
    DISPLAY_OPSZ,
    TEXT_OPSZ,
} from "https://framer.com/m/SharedTester-SB64gG.js@Dd5hSuq9KXwyNAlMQCX7"

// Cal Sans 2. Font machinery from Shared.tsx; the @font-face is injected
// at runtime via buildFontFaceCSS(ver) in the effect below (not hardcoded here).
const ver = CAL_SANS

// Control size (matches the specimen card's Large set). Weight×opsz dropdown options
// ("Text Regular" / "Regular" / …) built once from the shared WEIGHTS.
const GP_SIZE = { font: "14px", pad: "3px 8px", pillPad: 2, pillGap: 2 }
// Weight×opsz options grouped by optical size: all Display weights, then all Text, then
// all Micro. Micro opsz is hard-wired here (the font's small end), not in SharedTester.
const MICRO_OPSZ = 8
const GP_WEIGHT_OPTS = [
    ...WEIGHTS.map((w) => ({ label: w.name, weight: w.value, opsz: DISPLAY_OPSZ })),
    ...WEIGHTS.map((w) => ({
        label: `Text ${w.name}`,
        weight: w.value,
        opsz: TEXT_OPSZ,
    })),
    ...WEIGHTS.map((w) => ({
        label: `Micro ${w.name}`,
        weight: w.value,
        opsz: MICRO_OPSZ,
    })),
]

// Exact CSS from glyph-picker-styled.html, on the v2 variable family.
const csGpCSS = `
.cs-gp-container {
    --cs-gp-bg: #ffffff;
    --cs-gp-text: #242424;
    --cs-gp-gray-dark: #898989;
    --cs-gp-gray-light: #F3F4F6;
    --cs-gp-font-ui: "${ver.family}", system-ui, -apple-system, sans-serif;
    --cs-gp-font-specimen: "${ver.family}", system-ui, sans-serif;
    
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    height: auto;
    align-items: start;
    background: var(--cs-gp-bg);
    color: var(--cs-gp-text);
    font-family: var(--cs-gp-font-ui);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.cs-gp-container *, 
.cs-gp-container *::before, 
.cs-gp-container *::after {
    box-sizing: border-box;
}

/* Left Panel: Preview + Controls */
.cs-gp-panel-left {
    display: flex;
    flex-direction: column;
    padding: 32px;
    position: sticky;
    top: 0;
    height: 100vh;
    z-index: 9;
    min-width: 0; /* keep content inside the grid track (don't overflow the glyph grid) */
}

.cs-gp-controls-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

/* Mode Toggle (UI / Text / Geo) - Updated Desktop Sizing */
.cs-gp-mode-toggle-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    flex: 0 0 auto;
}

.cs-gp-mode-toggle {
    display: inline-flex;
    background: var(--cs-gp-gray-light);
    border-radius: 10px;
    padding: 4px;
    gap: 2px;
    align-items: center;
}

.cs-gp-mode-toggle-btn {
    padding: 6px 0;
    font-family: var(--cs-gp-font-ui);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: 0;
    font-variation-settings: "wght" 700, "GEOM" 25;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--cs-gp-gray-dark);
    cursor: pointer;
    width: 50px;
    text-align: center;
    transition: all 150ms ease-out;
}

.cs-gp-mode-toggle-btn.active {
    background: var(--cs-gp-bg);
    color: var(--cs-gp-text);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Weight Select */
.cs-gp-weight-select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.cs-gp-weight-select {
    appearance: none;
    background: transparent;
    border: none;
    font-family: var(--cs-gp-font-ui);
    font-size: 15px;
    font-weight: 550;
    font-variation-settings: "wght" 550, "GEOM" 25;
    color: var(--cs-gp-text);
    cursor: pointer;
    padding-right: 16px;
    text-align: right;
    text-align-last: right;
    outline: none;
}

.cs-gp-weight-select-icon {
    position: absolute;
    right: 0;
    pointer-events: none;
    width: 8px;
    height: 4px;
    stroke: #374151;
    top: 50%;
    transform: translateY(calc(-50% + 1px));
}

/* Glyph Viewer */
.cs-gp-viewer {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    max-height: 450px;
    gap: 20px;
}

.cs-gp-viewer-char-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex: 1;
    min-height: 0; /* let it shrink so the U+ code below is never pushed off */
    overflow: hidden;
}

.cs-gp-viewer-char {
    font-family: var(--cs-gp-font-specimen);
    /* capped by viewport HEIGHT too, so the glyph (with descenders) + the code below
       always fit the panel and aren't clipped at the bottom */
    font-size: clamp(72px, min(30vw, 34vh), 340px);
    line-height: 1.1;
    transition: font-variation-settings 0.2s ease;
}

.cs-gp-viewer-code {
    font-family: var(--cs-gp-font-ui);
    font-size: 16px;
    color: var(--cs-gp-gray-dark);
    letter-spacing: 0;
    font-variation-settings: "wght" 400, "GEOM" 25;
    margin-top: auto;
    padding-top: 20px;
}

/* Right Panel: Grid */
.cs-gp-right-wrapper {
    position: relative;
    max-height: 1800px;
    overflow: hidden;
    transition: max-height 0.4s ease-in-out;
}

.cs-gp-right-wrapper::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 150px;
    background: linear-gradient(to bottom, transparent, white);
    pointer-events: none;
    transition: opacity 0.3s;
}

.cs-gp-right-wrapper.is-expanded {
    max-height: none;
}

.cs-gp-right-wrapper.is-expanded::after {
    opacity: 0;
}

.cs-gp-show-more-btn {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    font-family: var(--cs-gp-font-ui);
    font-size: 15px;
    font-weight: 550;
    padding: 8px 16px;
    color: var(--cs-gp-text);
    background: white;
    border: 1px solid #ddd;
    border-radius: 20px;
    background-color: #ffffff;
    cursor: pointer;
}

.cs-gp-panel-right {
    border-left: 1px solid var(--cs-gp-gray-light);
    padding: 32px;
    padding-top: 45px;
    height: auto;
    min-width: 0;
}

.cs-gp-group {
    margin-bottom: 3rem;
}

.cs-gp-group-label {
    font-family: var(--cs-gp-font-ui);
    line-height: 120%;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--cs-gp-gray-dark);
    margin-bottom: 1.5rem;
    font-weight: 500;
    font-variation-settings: "wght" 500, "GEOM" 25;
}

.cs-gp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
    gap: 1.5rem 1rem;
}

.cs-gp-cell {
    appearance: none;
    border: none;
    background: transparent;
    font-family: var(--cs-gp-font-specimen);
    font-size: 24px;
    width: 100%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.1s;
    color: var(--cs-gp-text);
}

.cs-gp-cell:hover,
.cs-gp-cell:focus-visible {
    background: var(--cs-gp-gray-light);
    outline: none;
}

.cs-gp-cell--active {
    background: var(--cs-gp-text);
    color: var(--cs-gp-bg);
}

.cs-gp-cell--active:hover {
    background: var(--cs-gp-text);
}

.cs-gp-cell--invisible:not(.cs-gp-cell--active) {
    border: 1px dashed var(--cs-gp-gray-light);
}

.cs-gp-cell--active.cs-gp-cell--invisible {
    border: 1px solid var(--cs-gp-bg);
    background-color: var(--cs-gp-text);
    color: var(--cs-gp-bg);
    opacity: 1;
}

/* Mobile Support */
@media (max-width: 900px) {
    .cs-gp-container {
        grid-template-columns: 1fr 1fr;
        display: grid;
    }

    .cs-gp-panel-left {
        padding: 20px;
        height: 100vh;
        position: sticky;
        top: 0;
        border-bottom: none;
        min-width: 0;
    }

    .cs-gp-controls-header {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 1.25rem;
        margin-bottom: 1.5rem;
    }

    /* --- Scaled Down Specifically for Mobile Fit --- */
    .cs-gp-mode-toggle-btn {
        font-size: 11px;
        padding: 4px 0;
        width: 40px;
    }

    .cs-gp-weight-select-wrapper {
        width: auto;
    }

    .cs-gp-weight-select {
        font-size: 13px;
        text-align: right;
        text-align-last: right;
        width: auto;
        padding-right: 12px;
    }

    .cs-gp-weight-select-icon {
        display: block;
        right: 0;
    }

    .cs-gp-viewer {
        margin-top: 1em;
        margin-bottom: 1em;
    }

    .cs-gp-viewer-char {
        font-size: 128px;
    }

    .cs-gp-viewer-code {
        font-size: 12px;
    }

    .cs-gp-panel-right {
        border-left: 1px solid var(--cs-gp-gray-light);
        padding: 20px;
        padding-top: 25px;
        min-width: 0;
    }

    .cs-gp-group {
        margin-bottom: 2rem;
    }

    .cs-gp-group-label {
        font-size: 10px;
        line-height: 120%;
        margin-bottom: 1rem;
    }

    .cs-gp-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 0.5rem;
    }

    .cs-gp-cell {
        font-size: 23px;
        aspect-ratio: 1;
        padding: 0;
        line-height: 1;
    }
}

/* TOP-LEVEL (not nested) so it reliably applies at phone widths — a nested @media inside
   the 900px block was being ignored, leaving the tablet sizes in effect (huge preview). */
@media (max-width: 428px) {
    /* Single column, desktop-like: preview + controls STICK to the top; the glyph sample
       scrolls with the whole page beneath. Preview kept COMPACT so the sticky header
       doesn't eat the screen. Desktop 1800px cap + "Show all" overlay untouched. */
    .cs-gp-container {
        grid-template-columns: 1fr;
    }
    .cs-gp-panel-left {
        height: auto;
        position: sticky;
        top: 0;
        background: var(--cs-gp-bg);
        border-bottom: 1px solid var(--cs-gp-gray-light);
        z-index: 9;
    }
    /* compact preview so the sticky header stays short */
    .cs-gp-viewer {
        flex: 0 0 auto;
        max-height: none;
        gap: 8px;
        padding: 4px 0 8px;
    }
    .cs-gp-viewer-char-container {
        flex: 0 0 auto;
        min-height: 0;
    }
    .cs-gp-viewer-char {
        font-size: 64px;
    }
    .cs-gp-panel-right {
        border-left: none;
        padding: 16px 20px;
    }
    .cs-gp-cell {
        font-size: 15px;
    }
}

/* Dynamic Font Variation Application */
.cs-gp-cell, .cs-gp-viewer-char {
    /* explicit opsz below; WebKit drops opsz = default and auto-sizes over it */
    font-optical-sizing: none;
    /* the cossui build italicises by file, not by the ital axis */
    font-style: var(--cs-gp-style, normal);
    font-variation-settings: "wght" var(--cs-gp-weight, 400), "GEOM" var(--cs-gp-geom, 25), "SHRP" var(--cs-gp-shrp, 0), "YTAS" var(--cs-gp-ytas, 1440), "ital" var(--cs-gp-ital, 0), "opsz" var(--cs-gp-opsz, 36);
}

/* Axis on/off toggles — a B/I/U-style toolbar. Each glyph is rendered with its own
   axis maxed so the button illustrates the effect; filled = applied to the glyphs. */
.cs-gp-axis-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem 1.25rem;
    margin-bottom: 1.5rem;
}
.cs-gp-axis-toggles {
    display: inline-flex;
    width: fit-content;
    background: var(--cs-gp-gray-light);
    border-radius: 10px;
    padding: 4px;
    gap: 2px;
    align-items: center;
}
.cs-gp-axis-btn {
    width: 38px;
    height: 30px; /* match the GEOM toggle button height */
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--cs-gp-font-specimen);
    font-size: 19px;
    font-weight: 700;
    line-height: 1;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--cs-gp-gray-dark);
    cursor: pointer;
    transition: background 150ms ease-out, color 150ms ease-out;
}
.cs-gp-axis-btn:hover {
    background: rgba(0, 0, 0, 0.04);
    color: var(--cs-gp-text);
}
.cs-gp-axis-btn.active {
    background: var(--cs-gp-text);
    color: var(--cs-gp-bg);
}
/* rollover: sweep the axis 0 → 100 so the button previews its full range */
@keyframes cs-gp-cycle-shrp {
    from { font-variation-settings: "SHRP" 0; }
    to { font-variation-settings: "SHRP" 100; }
}
@keyframes cs-gp-cycle-ytas {
    from { font-variation-settings: "YTAS" 1440; }
    to { font-variation-settings: "YTAS" 1600; }
}
@keyframes cs-gp-cycle-ital {
    from { font-variation-settings: "ital" 0, "GEOM" 0; }
    to { font-variation-settings: "ital" 1, "GEOM" 0; }
}
.cs-gp-axis-btn--shrp:hover { animation: cs-gp-cycle-shrp 0.9s ease-in-out infinite alternate; }
.cs-gp-axis-btn--ytas:hover { animation: cs-gp-cycle-ytas 0.9s ease-in-out infinite alternate; }
.cs-gp-axis-btn--ital:hover { animation: cs-gp-cycle-ital 0.9s ease-in-out infinite alternate; }

/* Scrollbar styling */
.cs-gp-panel-right {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--cs-gp-gray-light) transparent;
}
.cs-gp-panel-right::-webkit-scrollbar {
    width: 6px;
}
.cs-gp-panel-right::-webkit-scrollbar-track {
    background: transparent;
}
.cs-gp-panel-right::-webkit-scrollbar-thumb {
    background: var(--cs-gp-gray-light);
    border-radius: 10px;
}
`

// Stylistic-set "escape hatches" (GSUB). The alternate forms aren't separately encoded —
// they only exist via the ssXX feature — so we surface them as extra groups whose cells
// render the base chars WITH the feature on. Each set is defined ONCE (affected chars are
// identical across GEOM bands; derived by shaping every cmap char through HarfBuzz on the
// v2 build). GEOM_BANDS curates which sets surface at each GEOM — only the swaps that
// differ from what's already on screen, so we never offer a form that's already active.
// (ssXX override rclt in the v2 build, so no "rclt 0" needed. Empty sets are auto-hidden.)
const SS = {
    ss02: { label: "Humanist a", chars: "aªàáâãäåæāăąǣȃạảấầẩẫậắằẳẵặ" },
    ss03: { label: "Geometric g", chars: "" },
    ss04: { label: "Gothic g", chars: "gĝğġģḡ" },
    ss05: { label: "Geometric G", chars: "GĜĞĠĢḠ₲" },
    ss06: { label: "Humanist G", chars: "" },
    ss07: { label: "Constructed j & y", chars: "jyýÿĳĵŷȷẏỳỵỷỹ" },
    ss08: { label: "Constructed f & t", chars: "ftţťŧțṭṯﬁﬂ" },
    ss09: { label: "Angular M", chars: "MṀṂ" },
    ss10: { label: "Futura alts", chars: "015Ccjtuyµ¹¼½ÇçùúûüýÿĆćĈĉĊċČčĳĵŊŋţťŧũūŭůűųŷưǖǘǚǜȗțȷπṭṯẏụủứừửữựỳỵỷỹ⁰⁵₀₁₅€⅛⅝" },
    ss11: { label: "Futura + ligations", chars: "ﬁﬂ" },
    ss12: { label: "Humanist 6 & 9", chars: "69⁶⁹₆₉" },
    ss14: { label: "A11Y I, l, a", chars: "IalÌÍÎÏàáâãäåāăąĨĪĮİĲĺļľŀłȃȊḷḹḻạảấầẩẫậắằẳẵặỈỊ" },
    ss16: { label: "Constructed l", chars: "lĺļľŀłḷḹḻ" },
}

const GEOM_BANDS = {
    0: ["ss02", "ss03", "ss05", "ss07", "ss08", "ss09", "ss10", "ss11", "ss12", "ss16"],
    25: ["ss02", "ss03", "ss05", "ss07", "ss08", "ss09", "ss10", "ss11", "ss12", "ss14", "ss16"],
    50: ["ss02", "ss04", "ss06", "ss09", "ss10", "ss11", "ss12", "ss14", "ss16"],
    100: ["ss02", "ss04", "ss06", "ss11", "ss12", "ss14", "ss16"],
}

const csGpData = [
    {
        label: "Letter — Uppercase Latin",
        chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞẞĀĂĄĆĈĊČĎĐĒĖĘĚĜĞĠĢĤĦĨĪĮİĲĴĶĹĻĽĿŁŃŅŇŊŌŐŒŔŖŘŚŜŞŠŢŤŦŨŪŬŮŰŲŴŶŸŹŻŽƏƑƠƯǢȂȆȊȎȒȖȘȚḌḠḤḪḴḶḸḺṀṂṄṆṈṜṞṢṬṮẀẂẄẎẒẔẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼẾỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴỶỸꞋ",
    },
    { label: "Letter — Uppercase Greek", chars: "ΞΩ" },
    {
        label: "Letter — Lowercase Latin",
        chars: "abcdefghijklmnopqrstuvwxyzßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿāăąćĉċčďđēėęěĝğġģĥħĩīįıĳĵķĸĺļľŀłńņňŋōőœŕŗřśŝşšţťŧũūŭůűųŵŷźżžơưǣȃȇȋȏȓȗșțȷəḍḡḥḫḵḷḹḻṁṃṅṇṉṝṟṣṭṯẁẃẅẏẓẕẖạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựǖǘǚǜỳỵỷỹꞌ",
    },
    { label: "Letter — Lowercase Greek", chars: "π" },
    { label: "Letter — Superscript Latin", chars: "ªº" },
    { label: "Letter — Ligature Latin", chars: "ﬁﬂ" },
    { label: "Number — Decimal Digit", chars: "0123456789" },
    { label: "Number — Small", chars: "₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹" },
    { label: "Number — Fraction", chars: "½¼¾⅛⅜⅝⅞⁄" },
    { label: "Punctuation", chars: "!#*.,/:;?\\¡·¿‖•…‼‽⸘" },
    { label: "Punctuation — Quote", chars: "\"'«»‘’‚“”„‹›" },
    { label: "Punctuation — Parenthesis", chars: "()[]{}" },
    { label: "Punctuation — Parenthesis Math", chars: "⟨⟩" },
    { label: "Punctuation — Dash", chars: "-_­–—" },
    { label: "Symbol", chars: "&@|¦§©®°¶†‡′″ℓ№™℮⍟Ⓓ★☆☑☒♡♥✓✔✗✘✦✧✨❤⭑⭒Ω♪♫" },
    { label: "Symbol — Currency", chars: "$¢£¤¥₡₦₨₩₪₫€₭₮₱₲₴₵₸₹₺₼₽₾₿" },
    { label: "Symbol — Currency Latin", chars: "ƒ" },
    { label: "Symbol — Currency Thai", chars: "฿" },
    { label: "Symbol — Math", chars: "%+<=>~¬±^µ×÷‰Ω∂∅∆∏∑−∕√∞∫∴∵≈≠≤≥" },
    { label: "Symbol — Arrow", chars: "↑↗→↘↓↙←↖↔↕" },
    { label: "Symbol — Geometry", chars: "■□▪▫◼◆◇◊▲▶▼◀△▷▽◁▴▸▾◂▵▹▿◃●○◌◦" },
    { label: "Separator", chars: "\r" },
    {
        label: "Separator — Space",
        chars: " \u00A0\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u200B\u202F",
    },
    { label: "Separator — Nonspace", chars: "\u200C\u200D" },
    { label: "Mark — Modifier", chars: "ʹʻʼˈ" },
    { label: "Mark — Spacing", chars: "`´ˆ˜¯˘˙¨˚˝ˇ¸˛" },
    { label: "Mark — Nonspacing", chars: "\u0300\u0301\u0302\u0303\u0304\u0306\u0307\u0308\u0309\u030A\u030B\u030C\u030F\u0311\u0312\u031B\u0323\u0324\u0326\u0327\u0328\u032E\u0331\u0338" },
    { label: "Uncategorised", chars: "⃁" },
]

// Pure per-glyph helpers — hoisted to module scope so the memoized cell can use them
// (and so they aren't rebuilt every render).
function csGpIsInvisible(char: string) {
    const invisibleCodePoints = [
        0x0020, 0x00a0, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006,
        0x2007, 0x2008, 0x2009, 0x200a, 0x200b, 0x202f, 0x205f, 0x3000, 0x200c,
        0x200d, 0x000d, 0x000a, 0x0009,
    ]
    return !char.trim() || invisibleCodePoints.includes(char.codePointAt(0) || 0)
}

// Combining marks (Unicode Mn) render blank on their own — show them on a dotted
// circle (◌) like a standard glyph browser so each is visible.
function csGpDisplay(char: string) {
    return /\p{Mn}/u.test(char) ? "◌" + char : char
}

// One glyph button. Memoized so selecting a glyph re-renders only the two cells whose
// `active` flips — not all ~2,500. Weight/GEOM/opsz reach the grid via CSS vars (not
// props), so those changes skip every cell too.
const GlyphCell = React.memo(function GlyphCell({
    char,
    feat,
    active,
    onSelect,
}: {
    char: string
    feat: string | null
    active: boolean
    onSelect: (char: string, feat: string | null) => void
}) {
    let className = "cs-gp-cell"
    if (active) className += " cs-gp-cell--active"
    if (csGpIsInvisible(char)) className += " cs-gp-cell--invisible"
    return (
        <button
            className={className}
            style={feat ? { fontFeatureSettings: `"${feat}" 1` } : undefined}
            onClick={() => onSelect(char, feat)}
            title={`U+${char.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}${feat ? " " + feat : ""}`}
        >
            {csGpDisplay(char)}
        </button>
    )
})

export default function GlyphPicker() {
    const [csGpWeight, setCsGpWeight] = useState(400)
    // GEOM value, not an index: A11y 0 / UI 25 / Base 50 / Geo 100 (UI = the font default)
    const [csGpGeom, setCsGpGeom] = useState(25)
    // opsz, driven by the weight×opsz dropdown (Display 36 default / Text 10).
    const [csGpOpsz, setCsGpOpsz] = useState(DISPLAY_OPSZ)
    // On/off axis toggles: Sharp → SHRP 100, Ascend → YTAS 1600, Italic → ital 1 (else default)
    const [csGpSharp, setCsGpSharp] = useState(false)
    const [csGpAscend, setCsGpAscend] = useState(false)
    const [csGpItalic, setCsGpItalic] = useState(false)
    const [csGpActiveChar, setCsGpActiveChar] = useState("A")
    // stylistic-set feature of the selected cell (null for a default-form glyph), so the
    // preview renders the same alternate the user clicked
    const [csGpActiveFeat, setCsGpActiveFeat] = useState<string | null>(null)
    const [expanded, setExpanded] = useState(false)

    // Cache-busting CSS injection
    useEffect(() => {
        const csGpStyleId = "cs-gp-exact-styles"

        const oldStyle = document.getElementById(csGpStyleId)
        if (oldStyle) oldStyle.remove()

        const style = document.createElement("style")
        style.id = csGpStyleId
        style.textContent = buildFontFaceCSS(ver) + "\n" + csGpCSS
        document.head.appendChild(style)

        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style)
            }
        }
    }, [])

    // Sync state to CSS variables
    useEffect(() => {
        document.documentElement.style.setProperty(
            "--cs-gp-weight",
            csGpWeight.toString()
        )
        document.documentElement.style.setProperty(
            "--cs-gp-geom",
            csGpGeom.toString()
        )
        const root = document.documentElement.style
        root.setProperty("--cs-gp-shrp", csGpSharp ? "100" : "0")
        root.setProperty("--cs-gp-ytas", csGpAscend ? "1600" : "1440")
        root.setProperty("--cs-gp-ital", csGpItalic ? "1" : "0")
        root.setProperty("--cs-gp-style", csGpItalic ? "italic" : "normal")
        root.setProperty("--cs-gp-opsz", csGpOpsz.toString())
    }, [csGpWeight, csGpGeom, csGpSharp, csGpAscend, csGpItalic, csGpOpsz])

    const csGpUnicodeCode = useMemo(() => {
        if (!csGpActiveChar) return ""
        return csGpActiveChar
            .codePointAt(0)
            .toString(16)
            .toUpperCase()
            .padStart(4, "0")
    }, [csGpActiveChar])

    // Stylistic "escape hatch" groups for the active GEOM band: the curated sets for this
    // GEOM, each defined once in SS, with empty (already-active) sets dropped.
    const ssGroups = useMemo(
        () =>
            (GEOM_BANDS[csGpGeom] || [])
                .map((tag) => {
                    const s = (SS as any)[tag]
                    return {
                        feat: tag,
                        label: `Stylistic — ${s.label} (${tag})`,
                        chars: s.chars,
                    }
                })
                .filter((g) => g.chars),
        [csGpGeom]
    )
    // Flattened once per GEOM change (not per render) — stable so memoized cells hold.
    const allGroups = useMemo(() => [...csGpData, ...ssGroups], [ssGroups])
    // Stable identity so GlyphCell's onSelect prop never changes → memo holds.
    const handleSelect = useCallback((char: string, feat: string | null) => {
        setCsGpActiveChar(char)
        setCsGpActiveFeat(feat)
    }, [])

    const gpWeightSel = Math.max(
        0,
        GP_WEIGHT_OPTS.findIndex(
            (o) => o.weight === csGpWeight && o.opsz === csGpOpsz
        )
    )

    return (
        <div className="cs-gp-container" id="cs-gp-app">
            <div className="cs-gp-panel-left">
                {/* Style controls — GEOM pill + V/h/I (matched pills) + weight×opsz
                    dropdown. Left-aligned; wraps/stacks on smaller sizes (no centering). */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        flexWrap: "wrap",
                        gap: "10px 14px",
                        marginTop: "40px",
                        marginBottom: "1.5rem",
                    }}
                >
                    <GeomToggle
                        family={ver.family}
                        size={GP_SIZE}
                        geom={GEOM_PRESET_LIST.findIndex(
                            (p) => p.geom === csGpGeom
                        )}
                        onChange={(i) => setCsGpGeom(GEOM_PRESET_LIST[i].geom)}
                        presets={GEOM_PRESET_LIST}
                    />
                    <AxisToggles
                        family={ver.family}
                        size={GP_SIZE}
                        sharp={csGpSharp}
                        ascend={csGpAscend}
                        italic={csGpItalic}
                        onSharp={() => setCsGpSharp((v) => !v)}
                        onAscend={() => setCsGpAscend((v) => !v)}
                        onItalic={() => setCsGpItalic((v) => !v)}
                    />
                    <ChevronSelect
                        family={ver.family}
                        size={GP_SIZE}
                        value={gpWeightSel}
                        onChange={(v) => {
                            const o = GP_WEIGHT_OPTS[+v]
                            setCsGpWeight(o.weight)
                            setCsGpOpsz(o.opsz)
                        }}
                        options={GP_WEIGHT_OPTS.map((o, i) => ({
                            label: o.label,
                            value: i,
                        }))}
                    />
                </div>

                {/* Viewer */}
                <div className="cs-gp-viewer">
                    <div className="cs-gp-viewer-char-container">
                        <div
                            className="cs-gp-viewer-char"
                            style={
                                csGpActiveFeat
                                    ? {
                                          fontFeatureSettings: `"${csGpActiveFeat}" 1`,
                                      }
                                    : undefined
                            }
                        >
                            {csGpDisplay(csGpActiveChar)}
                        </div>
                    </div>
                    <div className="cs-gp-viewer-code">
                        U+{csGpUnicodeCode}
                        {csGpActiveFeat ? ` · ${csGpActiveFeat}` : ""}
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div
                className={`cs-gp-right-wrapper ${expanded ? "is-expanded" : ""}`}
            >
                <div className="cs-gp-panel-right">
                    {allGroups.map((group, gIdx) => (
                        <div key={gIdx} className="cs-gp-group">
                            <div className="cs-gp-group-label">
                                {group.label}
                            </div>
                            <div className="cs-gp-grid">
                                {[...group.chars].map((char, cIdx) => {
                                    const feat = (group as any).feat || null
                                    return (
                                        <GlyphCell
                                            key={cIdx}
                                            char={char}
                                            feat={feat}
                                            active={
                                                csGpActiveChar === char &&
                                                csGpActiveFeat === feat
                                            }
                                            onSelect={handleSelect}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {!expanded && (
                    <div className="cs-gp-fade-overlay">
                        <button
                            className="cs-gp-show-more-btn"
                            onClick={() => setExpanded(true)}
                        >
                            Show all →
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
