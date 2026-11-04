"use client"

// Client boundary for components/CalFeatureSpecimen.tsx (section 18, 28 instances).
// SSR-safe: it injects its @font-face in an effect. Sizes that change per breakpoint are
// passed as CSS custom properties (fontSize="var(--fs-sample)"), which the component
// writes straight into its inline style, so the server render is already right at every
// width and nothing jumps on hydration.
export { default as CalFeatureSpecimen } from "@components/CalFeatureSpecimen"
