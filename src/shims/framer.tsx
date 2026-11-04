// Stand-in for Framer's runtime, aliased to `framer` in next.config.ts.
//
// The components import addPropertyControls and ControlType so Framer's editor can draw
// a property panel. Outside Framer there is no panel, so both are inert here: controls
// are recorded and otherwise ignored. Props come from the section files instead (the
// values captured from the live page, per breakpoint).

export const controlsRegistry = new Map<unknown, Record<string, unknown>>()

export function addPropertyControls(component: unknown, controls: Record<string, unknown>) {
    controlsRegistry.set(component, controls)
}

export const ControlType = {
    Boolean: "boolean",
    Number: "number",
    String: "string",
    Enum: "enum",
    Color: "color",
    Image: "image",
    File: "file",
    Object: "object",
    Array: "array",
    ComponentInstance: "componentinstance",
    ResponsiveImage: "responsiveimage",
    Transition: "transition",
    Link: "link",
    Date: "date",
    Padding: "padding",
    BorderRadius: "borderradius",
    Border: "border",
    BoxShadow: "boxshadow",
    Font: "font",
    SegmentedEnum: "segmentedenum",
    FusedNumber: "fusednumber",
    RichText: "richtext",
    Cursor: "cursor",
} as const

// Components branch on RenderTarget to behave differently on Framer's canvas. On the
// site it is always the live preview.
export const RenderTarget = {
    canvas: "CANVAS",
    export: "EXPORT",
    thumbnail: "THUMBNAIL",
    preview: "PREVIEW",
    current: () => "PREVIEW",
    hasRestrictions: () => false,
}

// Framer's static renderer is its SSR/thumbnail pass. On the site we always animate.
export function useIsStaticRenderer() {
    return false
}

export const withCSS = <T,>(component: T) => component
