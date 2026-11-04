"use client"

// Client boundary for components/CalFitSource.tsx (section 14, Weights).
//
// CalFitSource fits its one line (the widest name) to its column and publishes the size
// as `--cal-fit` on <html>; every `.cal-fit` row reads it. It renders on the server too
// (at 100px, before it has measured anything): section 14's CSS module overrides that
// first paint with the precomputed size until `--cal-fit` appears on <html>.
export { default as CalFitSource } from "@components/CalFitSource"
