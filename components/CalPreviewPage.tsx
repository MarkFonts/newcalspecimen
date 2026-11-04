import React, { useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"
import {
    calFont,
    FONT_CONTROLS,
    buildFontFaceCSS,
} from "https://framer.com/m/Shared-Endp4B.js@hk9Lk4UJ9bomCLQADDI6"

// ─────────────────────────────────────────────────────────────────────────────
// CalPreviewPage — a faithful port of the cal.com "Event Types" dashboard (the
// font-proofer #coss view), in Cal Sans v2 to show the font as real product UI.
// Markup + SVGs + CSS ported from wordmark.nyc/font-proofer; proofing-only bits
// (role highlighting, page switching, context menu) dropped. The mobile layout is
// an EXPOSED "Mobile" boolean — drive it from your Framer breakpoint so your page
// owns the swap (no @container / no internal width detection). Font from Shared.tsx.
// ─────────────────────────────────────────────────────────────────────────────

const CALPP_CSS = `
.calpp-root[data-theme="dark"]{--bg:#242424;--bg-elevated:#2e2e2e;--bg-hover:#383838;--border:#3a3a3a;--border-subtle:#2f2f2f;--text:#fff;--text-muted:#888;--text-dim:#555;--ink:#fff;--muted:rgba(255,255,255,0.42);--track-empty:#2b2b2b;--radius:6px;--sidebar-width:260px;}
.calpp-root[data-theme="light"]{--bg:#fff;--bg-elevated:#f9fafb;--bg-hover:#f3f4f6;--border:#e5e7eb;--border-subtle:#eef0f2;--text:#111827;--text-muted:#6b7280;--text-dim:#9ca3af;--ink:#111827;--muted:#6b7280;--track-empty:#e5e7eb;--radius:6px;--sidebar-width:260px;}
.calpp-root{width:100%;height:100%;}
.calpp-root .coss-shell{height:100%;}
/* Native controls reset the font via the UA font shorthand, so they don't inherit the
   family OR the GEOM axis. Force both to inherit so the sidebar (nav items + links are
   buttons) renders in Cal Sans, not system sans. */
.calpp-root button,.calpp-root input,.calpp-root select,.calpp-root textarea{font-family:inherit;font-variation-settings:inherit;}
.coss-shell {
  display: flex;
  width: 100%;
  height: 100%;
  background: #0f0f0f;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.07);
  container-type: inline-size;
}


.coss-mobile-bar { display: none; }
.coss-bottom-nav { display: none; }

.coss-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #111;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 0;
}
.coss-sidebar-top { display: flex; flex-direction: column; }
.coss-sidebar-bottom {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.coss-logo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 14px 12px;
}
.coss-wordmark {
  height: 16px;
  width: auto;
  color: #f0f0f0;
  flex-shrink: 0;
}
.coss-logo-actions { display: flex; align-items: center; gap: 6px; }
.coss-logo-icon {
  width: 15px;
  height: 15px;
  color: rgba(255,255,255,0.35);
}
.coss-avatar-img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  flex-shrink: 0;
}

.coss-nav { display: flex; flex-direction: column; gap: 1px; padding: 0 8px; }
.coss-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.68);
  cursor: pointer;
  text-align: left;
  transition: background 0.1s, color 0.1s;
  white-space: nowrap;
}
.coss-nav-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
.coss-nav-item.active { background: rgba(255,255,255,0.08); color: #f0f0f0; }
.coss-nav-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  color: currentColor;
  opacity: 0.8;
}
.coss-nav-chevron {
  width: 14px;
  height: 14px;
  margin-left: auto;
  opacity: 0.4;
  flex-shrink: 0;
}
.coss-ai-badge {
  margin-left: auto;
  font-size: 10px;
  padding: 2px 7px 2px 5px;
  border-radius: 99px;
  background: rgba(139,92,246,0.25);
  color: #c4b5fd;
  font-weight: 500;
  letter-spacing: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}
.coss-sparkle-icon {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
}

.coss-sidebar-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  text-align: left;
  transition: color 0.1s;
  white-space: nowrap;
}
.coss-sidebar-link:hover { color: rgba(255,255,255,0.7); }


.coss-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #161616;
  padding: 28px 32px;
  overflow-y: auto;
}
.coss-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}
.coss-page-title {
  color: #f0f0f0;
  cursor: pointer;
}
.coss-page-sub {
  color: rgba(255,255,255,0.45);
  margin-top: 3px;
  cursor: pointer;
}
.coss-header-actions { display: flex; align-items: center; gap: 8px; }
.coss-search-bar {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.coss-search-icon { width: 14px; height: 14px; color: rgba(255,255,255,0.4); }
.coss-new-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 7px;
  border: none;
  background: #f0f0f0;
  color: #111;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}


.coss-card-list { display: flex; flex-direction: column; gap: 2px; }
.coss-event-card {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.07);
  background: #1e1e1e;
  gap: 12px;
  position: relative;
}
.coss-event-card--paid::before,
.coss-event-card--hidden::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 10px;
  bottom: 10px;
  width: 3px;
  border-radius: 99px;
}
.coss-event-card--paid::before   { background: #22c55e; }
.coss-event-card--hidden::before { background: #f59e0b; }
.coss-card-left { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.coss-card-title-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.coss-card-title {
  color: #f0f0f0;
  cursor: pointer;
}
.coss-card-slug {
  color: rgba(255,255,255,0.35);
  cursor: pointer;
}
.coss-card-desc {
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 420px;
}
.coss-card-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.coss-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 99px;
  cursor: pointer;
}
.coss-badge--duration { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); }
.coss-badge--confirm  { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); }
.coss-badge--hidden   { background: rgba(245,158,11,0.15);  color: #fbbf24; }
.coss-badge--paid     { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.38); }
.coss-badge-icon { width: 10px; height: 10px; flex-shrink: 0; }

.coss-card-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.coss-toggle {
  width: 34px;
  height: 20px;
  border-radius: 99px;
  display: flex;
  align-items: center;
  padding: 2px;
  transition: background 0.2s;
  cursor: pointer;
}
.coss-toggle.on  { background: #22c55e; justify-content: flex-end; }
.coss-toggle.off { background: #3a3a3a; justify-content: flex-start; }
.coss-toggle-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
}
.coss-icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.1s, background 0.1s;
}
.coss-icon-btn svg { width: 15px; height: 15px; }
.coss-icon-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); }
.coss-icon-btn--menu {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
}
.coss-icon-btn--menu:hover,
.coss-icon-btn--menu.active {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.9);
  border-color: rgba(255,255,255,0.2);
}

.coss-menu-wrap { position: relative; }
.coss-ctx-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 4px;
  min-width: 220px;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}
.coss-ctx-section {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  padding: 6px 10px 4px;
  letter-spacing: 0.02em;
}
.coss-ctx-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.85);
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}
.coss-ctx-item:hover { background: rgba(255,255,255,0.07); }
.coss-ctx-item--muted { color: rgba(255,255,255,0.4); }
.coss-ctx-item--danger { color: #f87171; }
.coss-ctx-item--danger:hover { background: rgba(248,113,113,0.08); }
.coss-ctx-icon { width: 15px; height: 15px; flex-shrink: 0; opacity: 0.7; }
.coss-ctx-divider { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 0; }


.coss-bookings-tabs-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.coss-bookings-tabs {
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 3px;
}
.coss-bookings-tab {
  padding: 5px 12px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.1s, background 0.1s;
}
.coss-bookings-tab:hover { color: rgba(255,255,255,0.7); }
.coss-bookings-tab.active { background: rgba(255,255,255,0.12); color: #f0f0f0; }
.coss-bookings-filter-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  border-radius: 7px;
  font-size: 11px;
  margin-left: auto;
  transition: color 0.1s, border-color 0.1s;
}
.coss-bookings-filter-btn:hover { color: rgba(255,255,255,0.8); border-color: rgba(255,255,255,0.3); }

.coss-bookings-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 24px;
  text-align: center;
}
.coss-empty-icon { width: 32px; height: 32px; color: rgba(255,255,255,0.2); margin-bottom: 4px; }
.coss-empty-title { color: #f0f0f0; cursor: pointer; }
.coss-empty-sub { color: rgba(255,255,255,0.4); max-width: 320px; cursor: pointer; }

.coss-booking-list { display: flex; flex-direction: column; gap: 2px; }
.coss-booking-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 16px 20px;
  background: rgba(255,255,255,0.025);
  border-radius: 10px;
  position: relative;
}
.coss-booking-row.accent::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 10px;
  bottom: 10px;
  width: 3px;
  background: #f472b6;
  border-radius: 99px;
}
.coss-booking-grid {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: 160px 1fr;
  row-gap: 3px;
  column-gap: 20px;
  align-items: baseline;
}
.coss-booking-date-label { color: rgba(255,255,255,0.8); cursor: pointer; }
.coss-booking-time { color: rgba(255,255,255,0.45); }
.coss-booking-left-badge { padding-top: 6px; }
.coss-booking-title { color: rgba(255,255,255,0.85); cursor: pointer; }
.coss-booking-people { color: rgba(255,255,255,0.45); cursor: pointer; }
.coss-booking-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding-top: 6px; }
.coss-badge--platform { background: transparent; border: 1px solid rgba(255,255,255,0.18); color: rgba(255,255,255,0.85); }
.coss-badge--reschedule { background: rgba(245,158,11,0.15); color: #fbbf24; }
.coss-badge--cal { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.5); }

.coss-no-more {
  text-align: center;
  color: rgba(255,255,255,0.25);
  padding: 16px 0;
  cursor: pointer;
}









[data-theme="light"] .coss-shell                   { background: #fff; border-color: #e5e7eb; }
[data-theme="light"] .coss-sidebar                 { background: #fff; border-right-color: #e5e7eb; }
[data-theme="light"] .coss-sidebar-bottom          { border-top-color: #e5e7eb; }
[data-theme="light"] .coss-wordmark                { color: #111827; }
[data-theme="light"] .coss-logo-icon               { color: #6b7280; }
[data-theme="light"] .coss-nav-item                { color: #374151; }
[data-theme="light"] .coss-nav-item:hover          { background: #f3f4f6; color: #111827; }
[data-theme="light"] .coss-nav-item.active         { background: #eff6ff; color: #111827; }
[data-theme="light"] .coss-ai-badge                { background: rgba(139,92,246,0.12); color: #7c3aed; }
[data-theme="light"] .coss-sidebar-link            { color: #6b7280; }
[data-theme="light"] .coss-sidebar-link:hover      { color: #111827; }
[data-theme="light"] .coss-main                    { background: #f9fafb; }
[data-theme="light"] .coss-page-title              { color: #111827; }
[data-theme="light"] .coss-page-sub                { color: #6b7280; }
[data-theme="light"] .coss-search-bar              { border-color: #e5e7eb; background: #fff; }
[data-theme="light"] .coss-search-icon             { color: #9ca3af; }
[data-theme="light"] .coss-new-btn                 { background: #111827; color: #fff; }
[data-theme="light"] .coss-event-card              { background: #fff; border-color: #e5e7eb; }
[data-theme="light"] .coss-card-title              { color: #111827; }
[data-theme="light"] .coss-card-slug               { color: #9ca3af; }
[data-theme="light"] .coss-card-desc               { color: #4b5563; }
[data-theme="light"] .coss-badge--duration         { background: #f3f4f6; color: #374151; }
[data-theme="light"] .coss-badge--confirm          { background: #f3f4f6; color: #374151; }
[data-theme="light"] .coss-badge--hidden           { background: rgba(245,158,11,0.1); color: #b45309; }
[data-theme="light"] .coss-badge--paid             { background: #f3f4f6; color: #374151; }
[data-theme="light"] .coss-toggle.on               { background: #111827; }
[data-theme="light"] .coss-toggle.off              { background: #d1d5db; }
[data-theme="light"] .coss-icon-btn                { color: #9ca3af; }
[data-theme="light"] .coss-icon-btn:hover          { background: #f3f4f6; color: #374151; }
[data-theme="light"] .coss-icon-btn--menu.active   { background: #f3f4f6; color: #374151; }
[data-theme="light"] .coss-ctx-menu                { background: #fff; border-color: #e5e7eb; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
[data-theme="light"] .coss-ctx-item                { color: #374151; }
[data-theme="light"] .coss-ctx-item:hover          { background: #f3f4f6; }
[data-theme="light"] .coss-ctx-item--muted         { color: #9ca3af; }
[data-theme="light"] .coss-ctx-divider             { background: #e5e7eb; }
[data-theme="light"] .coss-bookings-tab            { color: #6b7280; }
[data-theme="light"] .coss-bookings-tab.active     { background: #f3f4f6; color: #111827; }
[data-theme="light"] .coss-bookings-filter-btn     { color: #374151; border-color: #e5e7eb; }
[data-theme="light"] .coss-booking-row             { background: #fff; }
[data-theme="light"] .coss-booking-date-label      { color: #111827; }
[data-theme="light"] .coss-booking-time            { color: #6b7280; }
[data-theme="light"] .coss-booking-title           { color: #111827; }
[data-theme="light"] .coss-booking-people          { color: #6b7280; }
[data-theme="light"] .coss-empty-title             { color: #111827; }
[data-theme="light"] .coss-empty-sub               { color: #6b7280; }
[data-theme="light"] .coss-empty-icon              { color: #d1d5db; }
[data-theme="light"] .coss-no-more                 { color: #9ca3af; }
[data-theme="light"] .coss-mobile-bar              { background: #fff; border-bottom-color: #e5e7eb; }
[data-theme="light"] .coss-mobile-wordmark         { color: #111827; }
[data-theme="light"] .coss-bottom-nav              { background: #fff; border-top-color: #e5e7eb; }
[data-theme="light"] .coss-bottom-btn              { color: #9ca3af; }
[data-theme="light"] .coss-bottom-btn--fab         { background: #111827; color: #fff; }



.coss-nav-item,.coss-sidebar-link{font-size:14px;}
.coss-page-title{font-size:20px;font-weight:700;letter-spacing:-0.01em;line-height:1.2;}
.coss-page-sub{font-size:13px;line-height:1.5;}
.coss-card-title{font-size:14px;font-weight:500;line-height:1.3;}
.coss-card-slug{font-size:12px;line-height:1.4;}
.coss-card-desc{font-size:13px;line-height:1.5;}
.coss-badge{font-size:11px;}
.coss-avatar-img{background:#d4d4d4;object-fit:cover;}

.coss-shell.is-mobile{flex-direction:column;}
.coss-shell.is-mobile .coss-sidebar{display:none;}
.coss-shell.is-mobile .coss-mobile-bar{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#111;border-bottom:1px solid rgba(255,255,255,0.06);flex-shrink:0;}
.coss-shell.is-mobile .coss-mobile-wordmark{font-size:15px;font-weight:600;color:#f0f0f0;letter-spacing:-0.01em;}
.coss-shell.is-mobile .coss-main{padding:20px 16px 12px;}
.coss-shell.is-mobile .coss-page-header{margin-bottom:16px;}
.coss-shell.is-mobile .coss-page-sub,.coss-shell.is-mobile .coss-search-bar,.coss-shell.is-mobile .coss-new-btn{display:none;}
.coss-shell.is-mobile .coss-card-slug{display:none;}
.coss-shell.is-mobile .coss-toggle,.coss-shell.is-mobile .coss-icon-btn:not(.coss-icon-btn--menu){display:none;}
.calpp-root[data-theme="light"] .coss-mobile-bar{background:#fff;border-bottom-color:#e5e7eb;}
.calpp-root[data-theme="light"] .coss-mobile-wordmark{color:#111827;}`

interface Props {
    font?: string
    cossRoman?: string
    cossItalic?: string
    geom: number
    theme: "light" | "dark"
    mobile: boolean
    card1: boolean
    card2: boolean
    card3: boolean
    card4: boolean
    card5: boolean
    avatar1: string
    avatar2: string
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 */
export default function CalPreviewPage(props: Props) {
    const {
        geom,
        theme,
        mobile,
        card1,
        card2,
        card3,
        card4,
        card5,
        avatar1,
        avatar2,
    } = props
    const ver = calFont(props)
    const family = `"${ver.family}", system-ui, sans-serif`

    useEffect(() => {
        const id = "calpp-styles"
        document.getElementById(id)?.remove()
        const s = document.createElement("style")
        s.id = id
        s.textContent = buildFontFaceCSS(ver) + "\n" + CALPP_CSS
        document.head.appendChild(s)
        return () => { if (document.head.contains(s)) document.head.removeChild(s) }
    }, [ver.family])

      const LucideIcon = ({ children }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="coss-nav-icon" aria-hidden="true">{children}</svg>
  )

      const navItems = [
    { key: 'eventTypes', label: 'Event Types', icon: (
      <LucideIcon><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 0 1 0 10h-2"/><line x1="11" y1="12" x2="13" y2="12"/></LucideIcon>
    )},
    { key: 'bookings', label: 'Bookings', icon: (
      <LucideIcon><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></LucideIcon>
    )},
    { key: 'availability', label: 'Availability', icon: (
      <LucideIcon><path d="M12 2a10 10 0 0 1 7.38 16.75"/><path d="M12 6v6l4 2"/><path d="M2.5 8.875a10 10 0 0 0-.5 3"/><path d="M2.83 16a10 10 0 0 0 2.43 3.4"/><path d="M4.636 5.235a10 10 0 0 1 .891-.857"/><path d="M8.644 21.42a10 10 0 0 0 7.631-.38"/></LucideIcon>
    )},
    { key: 'members', label: 'Members', icon: (
      <LucideIcon><path d="M16 2v2"/><path d="M17.915 22a6 6 0 0 0-12 0"/><path d="M8 2v2"/><circle cx="12" cy="12" r="4"/><rect x="3" y="4" width="18" height="18" rx="2"/></LucideIcon>
    )},
    { key: 'teams', label: 'Teams', icon: (
      <LucideIcon><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/></LucideIcon>
    )},
    { key: 'apps', label: 'Apps', chevron: true, icon: (
      <LucideIcon><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></LucideIcon>
    )},
    { key: 'routing', label: 'Routing', icon: (
      <LucideIcon><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></LucideIcon>
    )},
    { key: 'workflows', label: 'Workflows', badge: 'Cal AI', icon: (
      <LucideIcon><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></LucideIcon>
    )},
    { key: 'insights', label: 'Insights', icon: (
      <LucideIcon><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></LucideIcon>
    )},
  ]

    const eventTypes = [
        { id: 1, title: "15 Min Meeting", slug: "/pasquale/15min", desc: "A quick 15 minute call to discuss anything.", duration: "15m", badges: [], enabled: true,  show: card1 },
        { id: 2, title: "30 Min Meeting", slug: "/pasquale/30min", desc: "A standard 30 minute meeting for detailed discussions.", duration: "30m", badges: [], enabled: true,  show: card2 },
        { id: 3, title: "60 Min Consultation", slug: "/pasquale/consultation", desc: "An in-depth consultation for complex topics requiring detailed discussion and planning.", duration: "1h", badges: ["confirmation"], enabled: true,  show: card3 },
        { id: 4, title: "Secret Meeting", slug: "/pasquale/secret", desc: "A private meeting only accessible via direct link.", duration: "30m", badges: ["hidden"], enabled: true,  show: card4 },
        { id: 5, title: "Paid Consultation", slug: "/pasquale/paid-consultation", desc: "Premium consultation with payment required.", duration: "45m", badges: ["paid"], enabled: true,  show: card5 },
    ]

    return (
        <div
            className="calpp-root"
            data-theme={theme}
            style={{
                fontFamily: family,
                fontVariationSettings: `"GEOM" ${geom}`,
                width: "100%",
                height: "100%",
                minWidth: 320,
            }}
        >
          <div className={`coss-shell ${mobile ? "is-mobile" : ""}`}>
            {/* Mobile top bar */}
            <div className="coss-mobile-bar">
              <span className="coss-mobile-wordmark">Cal.com</span>
              <div className="coss-logo-actions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="coss-logo-icon"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                <img src={avatar1} alt="" className="coss-avatar-img" />
              </div>
            </div>
      
            {/* Sidebar */}
            <aside className="coss-sidebar">
              <div className="coss-sidebar-top">
                <div className="coss-logo-row">
                  <svg className="coss-wordmark" viewBox="0 0 1953.76354 400" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M196.05736,399.28317C84.22939,399.28317,0,312.18638,0,204.65949,0,96.77419,79.92832,8.96057,196.05736,8.96057c61.64874,0,104.30107,18.638,137.63442,61.29033l-53.76344,44.08603c-22.58066-23.65591-49.8208-35.48388-83.87098-35.48388-75.62724,0-117.20431,56.98925-117.20431,125.80645s45.51972,124.7312,117.20431,124.7312c33.69176,0,62.3656-11.82797,84.94623-35.48388l53.04661,45.87815c-31.89965,40.86022-75.62726,59.4982-137.99284,59.4982Z"/><path d="M565.59139,112.90322h72.40142v279.5699h-72.40142v-40.86022c-15.05375,29.03225-40.14336,48.3871-88.17207,48.3871-76.70252,0-137.99284-65.59141-137.99284-146.23657s61.29032-146.23656,137.99284-146.23656c47.67026,0,73.11826,19.35484,88.17207,48.3871v-43.01074ZM567.74194,253.76345c0-43.72759-30.46595-79.92832-78.4946-79.92832-46.23654,0-76.3441,36.55914-76.3441,79.92832,0,42.29392,30.10751,79.9283,76.3441,79.9283,47.67021,0,78.4946-36.55913,78.4946-79.9283Z"/><path d="M689.2473,0h72.40142v392.11471h-72.40142V0Z"/><path d="M793.90685,355.19713c0-22.93907,18.63798-42.29392,44.08603-42.29392s43.36914,19.35484,43.36914,42.29392c0,23.65591-18.27959,43.01075-43.3692,43.01075s-44.08598-19.35482-44.08598-43.01075Z"/><path d="M1158.42292,347.31184c-26.88172,32.25807-67.74192,52.68816-116.12901,52.68816-86.37995,0-149.82075-65.59141-149.82075-146.23657s63.44091-146.23656,149.82075-146.23656c46.59498,0,87.09673,19.35484,113.97845,49.82078l-55.914,46.23657c-13.97847-17.2043-32.25807-30.10753-58.06456-30.10753-46.23654,0-76.34404,36.55913-76.34404,79.9283s30.10751,79.92833,76.34404,79.92833c27.95695,0,47.31187-14.33692,61.64879-33.69176l54.48033,47.67029Z"/><path d="M1164.51616,253.76345c0-80.64516,63.44091-146.23656,149.82075-146.23656s149.82075,65.5914,149.82075,146.23656-63.44091,146.23655-149.82075,146.23655c-86.37984-.35842-149.82075-65.59138-149.82075-146.23655ZM1390.68106,253.76345c0-43.72759-30.10751-79.92832-76.34404-79.92832-46.23665-.35843-76.34415,36.2007-76.34415,79.92832,0,43.36917,30.10751,79.9283,76.34404,79.9283s76.34415-36.55913,76.34415-79.9283Z"/><path d="M1953.76354,221.50539v170.60932h-72.40148v-153.04659c0-48.3871-22.93916-69.17563-57.34767-69.17563-32.25807,0-55.19711,15.77062-55.19711,69.17563v153.04659h-72.40148v-153.04659c0-48.3871-23.29749-69.17563-57.34767-69.17563-32.25807,0-60.57346,15.77062-60.57346,69.17563v153.04659h-72.40148V112.5448h72.40148v38.70968c15.05381-30.10752,42.29386-45.1613,84.22939-45.1613,39.78497,0,73.11826,19.35484,91.39785,51.97133,18.27959-33.33333,45.1612-51.97133,93.90686-51.97133,59.49812.35843,105.73477,44.80288,105.73477,115.41221Z"/></svg>
                  <div className="coss-logo-actions">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="coss-logo-icon"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                    <img src={avatar1} alt="" className="coss-avatar-img" />
                    <img src={avatar2} alt="" className="coss-avatar-img" />
                  </div>
                </div>
                <nav className="coss-nav">
                  {navItems.map(item => (
                    <button
                      key={item.key}
                      className={`coss-nav-item ${item.key === 'eventTypes' ? 'active' : ''}`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="coss-ai-badge">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="coss-sparkle-icon"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>
                          {item.badge}
                        </span>
                      )}
                      {item.chevron && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="coss-nav-chevron"><path d="m9 18 6-6-6-6"/></svg>}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="coss-sidebar-bottom">
                {[
                  { label: 'View public page',      icon: <><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></> },
                  { label: 'Copy public page link', icon: <><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></> },
                  { label: 'Refer and earn',        icon: <><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></> },
                  { label: 'Settings',              icon: <><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></> },
                ].map(({ label, icon }) => (
                  <button key={label} className="coss-sidebar-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="coss-nav-icon">{icon}</svg>
                    {label}
                  </button>
                ))}
              </div>
            </aside>
      
            {/* Main content */}
            <main className="coss-main">
              <div className="coss-page-header">
                <div>
                  <div className="coss-page-title">
                    Event Types
                  </div>
                  <div className="coss-page-sub">
                    Create events to share for people to book on your calendar.
                  </div>
                </div>
                <div className="coss-header-actions">
                  <div className="coss-search-bar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="coss-search-icon"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                  </div>
                  <button className="coss-new-btn">+ New</button>
                </div>
              </div>
      
              <div className="coss-card-list">
                {eventTypes.filter((et) => et.show).map((et) => (
                  <div key={et.id} className={`coss-event-card${et.badges.includes('paid') ? ' coss-event-card--paid' : et.badges.includes('hidden') ? ' coss-event-card--hidden' : ''}`}>
                    <div className="coss-card-left">
                      <div className="coss-card-title-row">
                        <span className="coss-card-title">
                          {et.title}
                        </span>
                        <span className="coss-card-slug">
                          {et.slug}
                        </span>
                      </div>
                      <div className="coss-card-desc">
                        {et.desc}
                      </div>
                      <div className="coss-card-badges">
                        <span className="coss-badge coss-badge--duration">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="coss-badge-icon"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg>
                          {et.duration}
                        </span>
                        {et.badges.includes('confirmation') && (
                          <span className="coss-badge coss-badge--confirm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="coss-badge-icon"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
                            Requires confirmation
                          </span>
                        )}
                        {et.badges.includes('hidden') && (
                          <span className="coss-badge coss-badge--hidden">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="coss-badge-icon"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.8 10.8 0 0 1-1.444 2.49M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143M2 2l20 20"/></svg>
                            Hidden
                          </span>
                        )}
                        {et.badges.includes('paid') && (
                          <span className="coss-badge coss-badge--paid">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="coss-badge-icon"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                            $99
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="coss-card-right">
                      <div className={`coss-toggle ${et.enabled ? 'on' : 'off'}`}>
                        <div className="coss-toggle-thumb" />
                      </div>
                      <button className="coss-icon-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <div className="coss-menu-wrap">
                        <button
                          className="coss-icon-btn coss-icon-btn--menu"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="coss-no-more">
                  No more results
                </div>
              </div>
              </main>
            </div>
        </div>
    )
}

CalPreviewPage.defaultProps = {
    geom: 25,
    theme: "light",
    mobile: false,
    card1: true,
    card2: true,
    card3: true,
    card4: false,
    card5: true,
    avatar1: "",
    avatar2: "",
}

addPropertyControls(CalPreviewPage, {
    ...FONT_CONTROLS,
    avatar1: { type: ControlType.Image, title: "Team Avatar" },
    avatar2: { type: ControlType.Image, title: "User Avatar" },
    theme: { type: ControlType.Enum, title: "Theme", options: ["light", "dark"], optionTitles: ["Light", "Dark"], defaultValue: "light" },
    mobile: { type: ControlType.Boolean, title: "Mobile", defaultValue: false },
    card1: { type: ControlType.Boolean, title: "15 Min Meeting", enabledTitle: "On", disabledTitle: "Off", defaultValue: true },
    card2: { type: ControlType.Boolean, title: "30 Min Meeting", enabledTitle: "On", disabledTitle: "Off", defaultValue: true },
    card3: { type: ControlType.Boolean, title: "60 Min Consult", enabledTitle: "On", disabledTitle: "Off", defaultValue: true },
    card4: { type: ControlType.Boolean, title: "Secret Meeting", enabledTitle: "On", disabledTitle: "Off", defaultValue: false },
    card5: { type: ControlType.Boolean, title: "Paid Consult", enabledTitle: "On", disabledTitle: "Off", defaultValue: true },
    geom: { type: ControlType.Number, title: "GEOM", min: 0, max: 100, step: 1, defaultValue: 25 },
})
