# Blueprint Brand Guidelines

<!-- Brand: Blueprint™ | Version 2.0 | Feb 2026 -->
<!-- Blueprint connects businesses with the perfect fit for their specific mobile app developer needs, whether it's a single programmer or an entire team. -->

# General guidelines

- Only use absolute positioning when strictly necessary. Default to responsive layouts using flexbox and grid.
- Keep the UI clean, minimal, and information-dense — avoid decorative clutter.
- Always left-align or center-align elements. Never right-align text blocks.
- Maintain balanced margins and whitespace — do not scale content to the full width of the container, and do not use excessive whitespace either.
- Typography should be scaled to approximately 5/6 of the composition width for body text blocks.
- Keep compositions uncluttered. Do not crowd elements together.
- Do not mix type styles within a single text block.
- Refactor code as you go to keep it clean and maintainable.
- Keep file sizes small; put helper functions and components in their own files.
- All color usage on web must meet WCAG AA accessibility standards at minimum (4.5:1 contrast for normal text, 3:1 for large text and UI components).

---

# Design system guidelines

## Colors

Blueprint uses a dark-first color system. The primary background is near-black and the accent palette is intentionally restrained.

### Core Palette

| Name                                                 | Hex       | Usage                                                       |
| ---------------------------------------------------- | --------- | ----------------------------------------------------------- |
| **Black** (Primary Background)                       | `#1E1E1E` | Default page/app background                                 |
| **Off-White / Cream** (Primary Text & Light Surface) | `#F5F0E8` | Primary text on dark backgrounds; light surface backgrounds |
| **Purple** (Primary Accent)                          | `#7B5EA7` | Primary interactive color, CTAs, links, highlights          |
| **Teal / Green** (Secondary Accent)                  | `#3ECF8E` | Secondary accent, success states, bullet points             |
| **Mid-Grey** (Muted Text)                            | `#888888` | Captions, metadata, secondary labels                        |
| **Dark Grey** (Secondary Surface)                    | `#2C2C2C` | Card backgrounds, secondary surfaces                        |

### Gradient

The brand gradient runs from Purple (`#7B5EA7`) to Teal (`#3ECF8E`). Use sparingly — only for hero moments and brand accent applications.

### Accessibility & Contrast

- All web and interactive applications must meet **WCAG AA** as a minimum standard.
- WCAG AA: Large text ≥ 3:1, Normal text ≥ 4.5:1, UI graphics ≥ 3:1.
- WCAG AAA: Large text ≥ 4.5:1, Normal text ≥ 7:1.
- Aim for a limited, logical color palette. Avoid jarring or low-contrast combinations.
- White text on Black background achieves 15.82:1 — passes all levels.
- Purple (`#7B5EA7`) on Black achieves 7.5:1 — passes AA and AAA for normal text.
- Teal (`#3ECF8E`) on Black achieves 10.74:1 — passes all levels.

---

## Typography

### Primary Typeface: Saans

**Saans** is Blueprint's primary typeface. It sits at the core of the identity and was purposefully selected for its legibility and adaptability across complex, evolving digital systems.

Three variants are in use:

| Variant             | Weight        | Usage                                                                       |
| ------------------- | ------------- | --------------------------------------------------------------------------- |
| **Saans Medium**    | Medium (500)  | Headlines, subheads, UI labels, primary emphasis                            |
| **Saans Regular**   | Regular (400) | Body copy, general UI text                                                  |
| **Saans Semi-Mono** | Semi-Mono     | Metadata, code blocks, eyebrow labels, technical/subtitle-oriented contexts |

> Saans is built on the FK Grotesk extended Latin set: uppercase, lowercase, numerals, and punctuation. The font ships with many language presets for consistent global rendering. Reference the character chart before subsetting for web to keep load times tight while preserving essential glyphs.

### Type Hierarchy

| Level                | Style                   | Leading                | Tracking |
| -------------------- | ----------------------- | ---------------------- | -------- |
| **Headline**         | Saans Medium            | 1× multiplier (110%)   | −1       |
| **Subhead**          | Saans Medium            | 1× multiplier (110%)   | 0        |
| **Body Copy**        | Saans Regular or Medium | 1.2× multiplier (120%) | +2       |
| **Eyebrow / Detail** | Saans Semi-Mono         | 1.2× multiplier        | 0        |

### Scale and Proportion

Typography sizes must maintain a clear proportional relationship. Use the formula:

> **Base type size × (X) = Type size**

Example scale multipliers: ×1, ×1.5, ×3, ×5, ×8, ×12

There is no single mandated base size — establish a base and scale all other sizes proportionally from it.

### Line Length

- Optimal line length for body text: **45–75 characters**.
- Always set text **flush left / ragged right**.
- Avoid lines that are too short (creates awkward wrapping) or too long (reduces readability).

### Whitespace

- Typography should be scaled to approximately **5/6 of the composition width**.
- Avoid placing text too close to the edges of a container.
- Do not exceed the scale — text should not fill the full width.
- Do not use too much whitespace — text should not appear lost in a composition.

### Typography Don'ts

- Do not right-align text blocks.
- Do not crowd the composition — maintain breathing room between elements.
- Do not misalign type within a layout grid.
- Do not mix type styles (e.g., do not apply accent colors to random words within body copy).

---

## Logo

### Versions

The Blueprint logo consists of a custom icon mark (a stylized bird/cursor shape) paired with the wordmark "Blueprint." in Saans Medium. Available versions include:

- Full horizontal lockup (icon + wordmark)
- Icon mark only (for avatar / app icon use)
- Light version (off-white on dark backgrounds)
- Dark version (dark on light backgrounds)

### Clearspace

Always maintain a minimum clearspace around the logo equal to the height of the icon mark on all sides. Do not allow other elements to intrude into this zone.

### Minimum Sizes

Do not reproduce the full lockup at sizes where the wordmark becomes illegible. Use the icon-only mark at small sizes (e.g., favicons, app icons).

### Placement

- The logo may be placed in any corner or centered, depending on the layout context.
- Always ensure sufficient contrast between the logo and its background.
- On dark backgrounds, use the light (off-white) version.
- On light backgrounds, use the dark version.
- On the brand gradient, use the light version.

### Logo Don'ts

- Do not rotate or skew the logo.
- Do not stretch or distort proportions.
- Do not recolor the logo outside of approved versions.
- Do not place the logo on a busy or low-contrast background.
- Do not add drop shadows, outlines, or other effects.
- Do not recreate the logo in a different typeface.
- Do not use an outdated version of the logo.

---

## Spacing & Layout Principles

- Always left-align or center-align. Never right-align.
- Give elements the correct space between them — neither too tight nor too loose.
- Create relationships with the grid — align elements to a consistent underlying grid.
- Keep information clear and uncluttered.
- Maintain balanced margins — not too tight to the edge, not overly spaced.
- Typography compositions should use approximately 5/6 of the available width.

---

## Accessibility

- Meet **WCAG AA** as a minimum on all web and interactive applications.
- Scale and contrast are the two primary considerations for accessibility.
- Graphics and interface components must have a contrast ratio of at least **3:1**.
- Normal text must have a contrast ratio of at least **4.5:1** (AA) or **7:1** (AAA).
- Large text (≥19px regular or ≥24px) must have a contrast ratio of at least **3:1** (AA) or **4.5:1** (AAA).