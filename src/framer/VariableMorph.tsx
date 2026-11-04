"use client"

// Client boundary for components/VariableMorph.tsx (section 06). The live instance uses
// the component's defaults at every breakpoint; React 19 ignores defaultProps on function
// components, so they are passed explicitly. Its glyph colors are literals in the source
// (no color prop); section 06's module CSS re-colors them for dark mode.
import VariableMorphSource from "@components/VariableMorph"

export function VariableMorph() {
    return <VariableMorphSource glyph="a" fontSize={300} opszValue={300} duration={3} />
}
