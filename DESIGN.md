---
name: AI News Digest Design System
description: High-density cybernetic dark mode layout with glowing radial canvas mesh and glassmorphism.
colors:
  primary: "#C3FF2E"
  neutral-bg: "#000000"
  neutral-card: "rgba(255, 255, 255, 0.01)"
  neutral-border: "rgba(255, 255, 255, 0.05)"
  accent-purple: "rgba(168, 85, 247, 0.3)"
  accent-blue: "rgba(59, 130, 246, 0.3)"
typography:
  display:
    fontFamily: "var(--font-plus-jakarta), sans-serif"
    fontSize: "clamp(3rem, 8vw, 6rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "var(--font-plus-jakarta), sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "var(--font-plus-jakarta), sans-serif"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "1px"
rounded:
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "rgba(255, 255, 255, 0.02)"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "10px 20px"
---

# Design System: AI News Digest

## Overview

**Creative North Star: "The Terminal Orbit"**

A high-density cybernetic dark mode layout that emulates a mission control telemetry dashboard. The interface resides on a pitch black backdrop (`#000000`) layered with floating canvas-based neon radial mesh blobs in green, purple, and blue. Content is structured in clean glassmorphic cards with ultra-thin border hairlines, letting information density and status indicators serve as the primary visual interest.

**Key Characteristics:**
- **Pitch Black Foundation**: Viewports remain rooted in complete dark space to maximize accent contrast.
- **Fluid Telemetry Orbs**: Canvas composites radial blobs in neon lime, purple, and blue drifting dynamically.
- **Ultra-thin Hairline Accents**: Clean structural grid alignments replacing heavy panels.

## Colors

The color system relies on stark dark neutral backdrops highlighted by active neon status signals to convey data freshness.

### Primary
- **Hyper Neon Lime** (#C3FF2E): Used as the primary status indicator, brand tag highlights, primary active button fills, and action triggers.

### Neutral
- **Pitch Black Space** (#000000): The main page background value.
- **Glassmorphic Card Fill** (rgba(255, 255, 255, 0.01)): Transparent gray fill to generate visual structure over canvas mesh blobs.
- **Hairline Vapor Border** (rgba(255, 255, 255, 0.05)): Used for all cards, headers, grids, and boundaries.

**The Contrast Rareness Rule.** Neon accents are restricted to ≤10% of any given screen area. Accent density conveys interactive priority.

## Typography

**Display Font:** Plus Jakarta Sans (with system-ui sans-serif)
**Body Font:** Plus Jakarta Sans

### Hierarchy
- **Display** (800, clamp(3rem, 8vw, 6rem), 1.1): Hero titles and large branding indicators.
- **Headline** (700, 24px, 1.3): Major block headers.
- **Title** (600, 18px, 1.4): Card and modal titles.
- **Body** (400, 14px, 1.6): Summary blocks, paragraphs, and descriptions.
- **Label** (700, 10px, letter-spacing: 1px, uppercase): Mono-style status fields and badge tags.

## Layout

The page layout employs a flexible flexbox vertical app shell with sticky navigation and footer lines. Sub-sections align to an 8px modular spacing grid (`spacing.sm` / `spacing.md` / `spacing.lg`). Spacing density is tight to maximize information visibility on a single screen without requiring scrolling.

## Elevation & Depth

No traditional drop shadows exist. Depth is conveyed using glassmorphism backdrops (`backdrop-blur-xl`) and ambient glow backdrops.

**The Ambient Rest Rule.** Glass components remain flat. Hover interactions invoke active borders rather than box-shadow offsets.

## Shapes

Shapes utilize a crisp geometric strategy. Cards and inputs employ an 8px radius (`rounded.md`), while larger panels use a 12px radius (`rounded.lg`).

## Components

### Buttons
- **Shape**: Rounded corners (8px radius)
- **Primary**: Neon lime background, black text, with monospace uppercase letters.
- **Secondary**: Semitransparent white background, white text, and a thin hairline vapor border.

### Cards / Containers
- **Corner Style**: Rounded corners (12px radius)
- **Background**: Translucent white fill (rgba(255, 255, 255, 0.01)) with 24px blur overlay.
- **Border**: Thin vapor line (1px solid rgba(255, 255, 255, 0.05)).

## Do's and Don'ts

### Do:
- **Do** wrap background canvas layers in `absolute inset-0 overflow-hidden pointer-events-none` to prevent page scroll expansion.
- **Do** use uppercase monospace text for metadata labels and status tags to fit the terminal theme.

### Don't:
- **Don't** use standard box-shadow drops. Depth is strictly defined by opacity layers and backdrop blur.
- **Don't** use solid or bright gray background panels. Keep background blocks translucent to let mesh gradient orbs pass through.
