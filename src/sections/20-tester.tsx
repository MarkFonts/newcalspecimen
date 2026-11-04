// 20 · Tester
// Built from: CustomTypeTester (≥810), KaossTester (≤809)
//
// A card with a big editable line of type and axis controls. Two components, one per
// range, as on the live page: CustomTypeTester's sliders from 810 up, KaossTester's
// touch pads on phones. Both are server-rendered and CSS shows the one for the viewport
// (Framer's `hidden-*` classes, as Tailwind bands).
//
// Their hard-coded UI colors (about 7 each) are themed to tokens in 20-tester.module.css,
// which overrides the inline styles from outside; the components are not edited.
// KaossTester's 320px box is contained in the card (see .kaossSlot in the module).
import { CustomTypeTester } from "@/framer/CustomTypeTester"
import { KaossTester } from "@/framer/KaossTester"
import styles from "./20-tester.module.css"

export default function Tester() {
    return (
        <section
            id="tester"
            data-framer-name="Tester"
            className="page-measure section-y relative z-[1] flex flex-col items-center justify-center py-2.5"
        >
            <div
                data-framer-name="Card"
                className={`${styles.testers} flex w-full flex-col items-center justify-center gap-20 rounded-[12px] border border-border bg-card shadow-[0_1px_21px_4px_#2424241a,0_4px_8px_#2424240d] dark:shadow-[0_1px_21px_4px_#0000004d,0_4px_8px_#00000033] max-bp810:px-[clamp(0px,calc((100%-322px)/2),20px)] max-bp810:py-5 bp810:p-24`}
            >
                {/* Phones (≤809): KaossTester, 320 wide, centered. */}
                <div className={`${styles.kaossSlot} relative flex-none bp810:hidden`}>
                    <KaossTester
                        font="full"
                        text="Type away..."
                        defaultSize={60}
                        defaultSpacing={0}
                        defaultWeight={400}
                        previewHeight={240}
                        refreshColor="rgb(102, 102, 102)"
                        refreshSize={28}
                        debug={false}
                    />
                </div>
                {/* 810 and up: CustomTypeTester, full width; props per band in its wrapper. */}
                <div className="relative w-full flex-none max-bp810:hidden">
                    <CustomTypeTester />
                </div>
            </div>
        </section>
    )
}
