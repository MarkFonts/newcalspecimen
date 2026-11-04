"use client"

// Client boundary for components/KaossTester.tsx (section 20, phones only: ≤809). SSR-safe:
// browser APIs only in effects; its debug portal checks for document first. Its hard-coded
// UI colors are themed from src/sections/20-tester.module.css, not here.
export { default as KaossTester } from "@components/KaossTester"
