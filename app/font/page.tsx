// cal.com/font: everything between Cal.com's site header and footer.
//
// No nav and no footer here: Cal.com's site layout supplies both. The Hero starts at the
// very top of the page, under Cal.com's sticky floating nav (sticky top-2, h-16,
// max-w-[1320px]), with no spacer, as on the live Framer page and on staging.
//
// 23 sections ported from Framer, in Framer's order, then Cal.com's own FAQ (24) kept from
// their staging page. The space between sections is one rule in globals.css (.page-content). One file per section in
// src/sections/NN-slug.tsx.
//
// This file is a server component. Framer code components cross into the client through
// the "use client" files in src/framer/.
import type { Metadata } from "next"
import { Reveal } from "@/lib/Reveal"
import Hero from "@/sections/01-hero"
import Info from "@/sections/02-info"
import StickerViews from "@/sections/03-sticker-views"
import ScrollContainer from "@/sections/04-scroll-container"
import VariableAxes from "@/sections/05-variable-axes"
import VectorHandles from "@/sections/06-vector-handles"
import DisplayToTextA from "@/sections/07-display-to-text-a"
import DisplayToTextB from "@/sections/08-display-to-text-b"
import TextBlurA from "@/sections/09-text-blur-a"
import TextBlurB from "@/sections/10-text-blur-b"
import OpenSourceA from "@/sections/11-open-source-a"
import OpenSourceB from "@/sections/12-open-source-b"
import UiLiveView from "@/sections/13-ui-live-view"
import Weights from "@/sections/14-weights"
import Typer from "@/sections/15-typer"
import WaterfallSample from "@/sections/16-waterfall-sample"
import Paragraphs from "@/sections/17-paragraphs"
import Opentype from "@/sections/18-opentype"
import IconsAndEmojis from "@/sections/19-icons-and-emojis"
import Tester from "@/sections/20-tester"
import Glyphset from "@/sections/21-glyphset"
import Usages from "@/sections/22-usages"
import CtaDownload from "@/sections/23-cta-download"
import Faq from "@/sections/24-faq"

export const metadata: Metadata = {
    title: "Cal Sans",
    description: "Cal Sans, the open-source typeface from Cal.com.",
}

export default function FontPage() {
    return (
        <main>
            <article>
                <div className="comark-content page-content">
                    <Hero />
                    <Info />
                    <StickerViews />
                    <ScrollContainer />
                    <VariableAxes />
                    <VectorHandles />
                    <DisplayToTextA />
                    <DisplayToTextB />
                    <TextBlurA />
                    <TextBlurB />
                    <OpenSourceA />
                    <OpenSourceB />
                    <UiLiveView />
                    <Weights />
                    <Typer />
                    {/* No space above this one on phones (≤809), as on the live page: see globals.css. */}
                    <WaterfallSample />
                    <Paragraphs />
                    <Opentype />
                    <IconsAndEmojis />
                    <Tester />
                    <Glyphset />
                    <Usages />
                    <CtaDownload />
                    <Faq />
                </div>
                <Reveal />
            </article>
        </main>
    )
}
