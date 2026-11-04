"use client"

// Client boundary for components/GlyphPicker.tsx (section 21). No props. It renders on
// the server (881 cells), injects its own <style id="cs-gp-exact-styles"> on mount, and
// writes its axis state as --cs-gp-* variables on <html>. Theming is done from the
// section's CSS module through the component's own --cs-gp-* color variables.
export { default as GlyphPicker } from "@components/GlyphPicker"
