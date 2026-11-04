"use client"

// Client boundary for components/Copy.tsx (default export CopyButton): the clipboard icon
// in section 23's two command boxes. navigator.clipboard is only touched in its click
// handler, so it renders on the server too.
export { default as Copy } from "@components/Copy"
