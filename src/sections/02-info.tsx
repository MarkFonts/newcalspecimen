// 02 · Info
// Built from: native (Framer rich text + FAQ list)
//
// Two columns inside the panel: "Information" with four paragraphs, and a
// three-item accordion. Stacked below 1200. Server component; only the accordion
// (src/framer/FaqList.tsx) runs on the client.
//
// The Credits answer is the 1200–1919 copy at every width (Mark, 2026-11-02). Framer's
// empty questions 4 and 5 are never rendered and are not ported.
import type { FaqEntry } from "@/framer/FaqList"
// import { FaqList } from "@/framer/FaqList" // see the note in the JSX below
import styles from "./02-info.module.css"
import { Section } from "./Section"

const INTRO = [
    "Cal Sans started as a headline face — a love letter to digital builders. People used it everywhere anyway and they begged for more styles, so WORDMARK redrew it to actually work everywhere to finish the job.",
    "v2 is one variable font with three optical sizes built in: Cal Sans for punchy headlines (30–45px), Cal Sans Text for running copy (14–24px), and Cal Sans Micro for functional text components like meta tags, labels, table column headings, pill/toast text—anything below 14px. Cal Sans variable automatically adjusts size-specific letter spacing and apertures, and picks the right alternates for you.",
    "It’s a geometric sans serif built for tough use cases. Letters behave the way readers expect. It stays warm where most geometrics go cold — more bounce per ounce, but still transparent, neutral, unopinionated. And when you need horsepower, the tight headlines turn heads with nothing but simplicity.",
    "Funded by Cal.com, released free via NPM and through Google Fonts.",
]

const LANGUAGES =
    "Afrikaans • Albanian • Asturian • Asu • Azerbaijani • Basque • Bemba • Bena • Bosnian • Breton • Catalan • Cebuano • Chiga • Colognian • Cornish • Corsican • Croatian • Czech • Danish • Embu • English • Esperanto • Estonian • Faroese • Filipino • Finnish • French • Friulian • Galician • Ganda • German • Gusii • Haitian Creole • Hawaiian • Hungarian • Icelandic • Ido • Igbo • Inari Sami • Indonesian • Interlingua • Irish • Italian • Javanese • Jju • Jola-Fonyi • Kabuverdianu • Kalaallisut • Kalenjin • Kamba • Kikuyu • Kinyarwanda • Latvian • Lithuanian • Lojban • Lower Sorbian • Luo • Luxembourgish • Luyia • Machame • Makhuwa-Meetto • Makonde • Malagasy • Malay • Maltese • Manx • Māori • Mapuche • Marshalleese • Meru • Mohawk • Morisyen • Mvskoke • North Ndebele • North Sámi • Northern Sotho • Norwegian Bokmål • Norwegian Nynorsk • Nyanja • Nyankole • Occitan • Oromo • Pite Sámi • Polish • Portuguese • Quechua • Romanian • Romansh • Rombo • Rundi • Rwa • Samburu • Samoan • Sango • Sangu • Sardinian • Scottish Gaelic • Sena • Serbian • Shambala • Shona • Sicilian • Slovak • Slovenian • Soga • Somali • South Ndebele • Southern Sotho • Spanish • Sundanese • Swahili • Swati • Swedish • Swiss German • Taita • Taroko • Teso • Tongan • Tsonga • Tswana • Turkish • Turkmen • Ume Sámi • Upper Sorbian • Uzbek • Vietnamese • Vunjo • Walloon • Welsh • Wolastoqey • Wolof • Xhosa • Zulu"

// Not rendered for now: see the note in the JSX below.
export const ITEMS: FaqEntry[] = [
    {
        question: "Credits & acknowledgements",
        answer: (
            <div className={styles.answer}>
                <p>
                    <strong>Typeface design, mastering, and variable typeface animations</strong>
                    <br />
                    <a href="https://wordmark.nyc/" target="_blank">
                        WORDMARK
                    </a>
                    , the typographic practice of Mark Davis
                    <br />
                    <br />
                    <strong>Acknowledgements</strong>
                    <br />
                    Thank you to Peer and Cal.com for commissioning this project.
                </p>
                <p>
                    The following people were invaluable to this project, in no specific order, with an
                    undisclosed amount of personal (or impersonal) influence:
                </p>
                <ul>
                    <li>Paul Renner</li>
                    <li>Roger Black, David Berlow, Tobias Frere-Jones, Matthew Carter, Jonathan Hoefler</li>
                    <li>Nina Stössinger, Troy Leinster, Matthew Rechs</li>
                    <li>Hannes Famira, Cara Di Edwardo, Andy Clymer, David Jonathan Ross, Thomas Jockin</li>
                    <li>
                        <a href="https://github.com/calcom/sans-ui/blob/main/github.com/arrowtype/type-x">
                            ArrowType’s Type-x Chrome Extension (
                        </a>
                        <a
                            href="https://chromewebstore.google.com/detail/type-x/paelebbajjhdmomglaffoachiepobeag"
                            target="_blank"
                            rel="nofollow"
                        >
                            Chrome Store Link)
                        </a>
                    </li>
                    <li>
                        <a href="https://megumi.co" target="_blank">
                            Megumi Tanaka
                        </a>{" "}
                        for Framer development and content strategy
                    </li>
                    <li>
                        Eva Roa my love, WORDMARK COO and resident Python expert and evaGPT terminal; Doriel Jacov
                    </li>
                    <li>Scott and Lori Davis for the support</li>
                </ul>
            </div>
        ),
    },
    {
        question: "Supported languages",
        answer: (
            <div className={styles.answer}>
                <p>{LANGUAGES}</p>
            </div>
        ),
    },
    {
        question: "Release history",
        answer: (
            <div className={styles.answer}>
                <ul>
                    <li>
                        <a href="https://github.com/calcom/sans/releases/tag/v1.0.0" target="_blank">
                            2021.11.03 v1.00 Cal Sans SemiBold
                        </a>
                    </li>
                    <li>
                        <a href="https://fonts.google.com/specimen/Cal+Sans" target="_blank">
                            2025.02.13 v1.100 Cal Sans SemiBold
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/calcom/sans-ui/releases/tag/1.1.0" target="_blank">
                            2025.12.09 v1.500 Cal Sans UI &amp; Cal Sans Text.
                            <br />
                        </a>
                        <strong>Axes:</strong>
                        <br />
                        MODE 0–1
                        <br />
                        wght 300–700
                    </li>
                    <li>
                        2026.03.15 v1.600 Cal Sans UI, Cal Sans Text, Cal Sans Geo. Internal RC only,{" "}
                        <em className="font-demo">depreciated.</em>
                        <br />
                        <strong>Axes:</strong>
                        <br />
                        GEOM 0–100
                        <br />
                        wght 400–700
                    </li>
                    <li>
                        <a href="https://github.com/calcom/sans/releases/tag/v2.003" target="_blank">
                            2026.09.23 v2.003. Sizes: Cal Sans, Cal Sans Text, Cal Sans Micro. Stylistic families:
                            A11y, UI, Base, Geo.
                        </a>
                        <br />
                        <strong>Axes:</strong>
                        <br />
                        GEOM 0–100
                        <br />
                        SHRP: 0–100
                        <br />
                        YTAS: 720–800
                        <br />
                        opsz: 8–45
                        <br />
                        wght 400–700
                    </li>
                </ul>
            </div>
        ),
    },
]

export default function Info() {
    return (
        <Section id="info" framerName="Info">
            {/* The panel. The text sits on the page's 800px headline column. */}
            <div className="relative flex w-px flex-[1_0_0] flex-col items-center justify-center py-5 bp810:py-8">
                <div className="relative flex w-full max-w-[800px] flex-col items-start justify-start gap-6 overflow-hidden">
                    <h2 className="w-full text-subhead">Information</h2>
                    <div className="w-full text-lede [&>p+p]:mt-3.5">
                        {INTRO.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>
                    {/* Credits, languages, and release history are commented out (Mark, 2026-11-03): they
                        live on GitHub. To bring them back, restore this line and the FaqList import.
                    <FaqList items={ITEMS} /> */}
                </div>
            </div>
        </Section>
    )
}
