import type { Metadata } from "next"
import { fontVariables, LITERAL_FONT_FACES, YTAS_RANGE_SCRIPT } from "@/fonts"
import { ThemeToggle } from "@/dev/ThemeToggle"
import "./globals.css"

// Stand-in for Cal.com's root layout. In their repo only three things move over: the font
// variables on <html> (src/fonts.ts), and the literal @font-face block and the YTAS probe in <head>.
// Their layout supplies the nav and footer; this one has neither on purpose.

// This app's own text font, the latest Cal Sans site build from calcom/sans. It's here and not in
// src/fonts.ts because this layout doesn't move: on Cal.com's site their layout sets
// --font-cal-sans, and the text uses whichever Cal Sans they serve.
//
// Load order (Mark, 2026-11-05): the page's own Cal Sans 2 comes first, and this build is fetched
// after it, once the page has loaded and the browser is idle, or sooner if the reader nears the
// "Version 2.000" header (section 05). Until it lands the text stack falls back to Cal Sans 2,
// which is what the fallback is for; when it lands the text swaps. No preload, so it never
// competes with the fonts the demos need.
const TEXT_FONT_URL = "https://cdn.jsdelivr.net/gh/calcom/sans@main/fonts/calsans-cossui/CalSansVF.woff2"
const TEXT_FONT_FACE = `@font-face{font-family:calSans;src:url("${TEXT_FONT_URL}") format("woff2");font-weight:400 700;font-style:normal;font-display:swap}`
const TEXT_FONT = `:root{--font-cal-sans:calSans}`
const TEXT_FONT_SCRIPT = `(function(){var done=false;function add(){if(done)return;done=true;var s=document.createElement("style");s.id="text-font-face";s.textContent=${JSON.stringify(TEXT_FONT_FACE)};document.head.appendChild(s)}
function arm(){var el=document.getElementById("variable-axes");if(!el||!("IntersectionObserver" in window))return;var io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++)if(es[i].isIntersecting){add();io.disconnect();return}},{rootMargin:"100% 0px"});io.observe(el)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",arm);else arm();
function idle(){(window.requestIdleCallback||function(f){setTimeout(f,200)})(add)}
if(document.readyState==="complete")idle();else window.addEventListener("load",idle)})();`

export const metadata: Metadata = {
    title: "Cal Sans",
    description: "Cal Sans, the open-source typeface from Cal.com.",
}

const THEME_SCRIPT = `(function(){try{var q=matchMedia("(prefers-color-scheme: dark)");var p=new URLSearchParams(location.search).get("theme");var s=null;try{s=localStorage.getItem("fp-dev-theme")}catch(e){}var m=document.cookie.match(/(?:^|; )theme=(light|dark)(?:;|$)/);var v=p||s||(m&&m[1]);var dark=v?v==="dark":q.matches;var r=document.documentElement;r.classList.toggle("dark",dark);r.style.colorScheme=dark?"dark":"light"}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        // suppressHydrationWarning: the dev theme toggle (and Cal.com's own theme script)
        // sets .dark on <html> before React hydrates.
        <html lang="en" className={fontVariables} suppressHydrationWarning>
            <head>
                {/* Stand-in for Cal.com's own theme script, the same logic, so dark mode is set before
                    the first paint. Theirs replaces it. The dev toggle's choice wins here. */}
                <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
                <style id="text-font" dangerouslySetInnerHTML={{ __html: TEXT_FONT }} />
                <script dangerouslySetInnerHTML={{ __html: TEXT_FONT_SCRIPT }} />
                {/* Families the Framer components ask for by name ("Cal Sans 2", …). */}
                <style id="literal-font-faces" dangerouslySetInnerHTML={{ __html: LITERAL_FONT_FACES }} />
                <script dangerouslySetInnerHTML={{ __html: YTAS_RANGE_SCRIPT }} />
            </head>
            <body className="bg-background text-foreground antialiased">
                {children}
                {process.env.NODE_ENV !== "production" && <ThemeToggle />}
            </body>
        </html>
    )
}
