// 13 · UI live view
// Built from: CalPreviewPage
//
// A heading and subtitle over a non-interactive copy of Cal.com's "Event Types"
// dashboard set in Cal Sans: the desktop layout with a sidebar from 810px, the phone
// layout (no sidebar, three cards) below. The dashboard follows the site theme.
import { asset } from "@/lib/asset"
import { CalPreviewPage } from "@/framer/CalPreviewPage"
import styles from "./13-ui-live-view.module.css"
import { Section } from "./Section"

export default function UiLiveView() {
    return (
        <Section
            id="ui-live-view"
            framerName="UI live view"
            className="gap-0 bp810:gap-2.5"
        >
            {/* Section: the column (round 2: no side rules; round 1 drew Framer's 1px overlay). */}
            <div
                data-framer-name="Section"
                className="relative flex w-px flex-[1_0_0] flex-col items-center justify-center py-5 bp810:gap-8 bp810:py-8 bp1200:gap-16 bp1200:py-16 "
            >
                <div
                    data-framer-name="Text Wrapper"
                    className="flex w-full max-w-[800px] flex-none flex-col items-center justify-center gap-6 overflow-hidden text-left"
                >
                    <h2 className="w-full text-subhead">
                        For any UI worth building
                    </h2>
                    <p className="w-full text-lede">
                        Balanced metrics. Caps matched to ascenders. Vertical alignment shared with Inter, Geist,
                        Roboto, Helvetica, SF Pro, and Segoe UI. The warmth is new. The foundation is familiar. 400
                        components, maintained by Cal, ready for anyone.
                    </p>
                </div>
                <div className={`w-full flex-none ${styles.preview}`}>
                    <CalPreviewPage
                        geom={25}
                        card1
                        card3
                        card4={false}
                        card5
                        avatar1={asset("/font/13-ui-live-view/team-avatar.jpg")}
                        avatar2={asset("/font/13-ui-live-view/user-avatar.jpg")}
                    />
                </div>
            </div>
        </Section>
    )
}
