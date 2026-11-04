import type { Metadata } from "next"
import { fontVariables, LITERAL_FONT_FACES } from "@/fonts"
import { ThemeToggle } from "@/dev/ThemeToggle"
import "./globals.css"

// Stand-in for Cal.com's root layout. In their repo only two things move over: the font
// variables on <html> (src/fonts.ts) and the literal @font-face block in <head>.
// Their layout supplies the nav and footer; this one has neither on purpose.

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
                {/* Families the Framer components ask for by name ("Cal Sans 2", …). */}
                <style id="literal-font-faces" dangerouslySetInnerHTML={{ __html: LITERAL_FONT_FACES }} />
            </head>
            <body className="bg-background text-foreground antialiased">
                {children}
                {process.env.NODE_ENV !== "production" && <ThemeToggle />}
            </body>
        </html>
    )
}
