# Design: FR Operations

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.

## System
- Genre: modern-minimal
- Shape of the first page: Index-First (draw d9b67a), Corridor hero
- Theme: brand (navy and ember from the old Tailwind config, Barlow Condensed and Barlow)
- Axes: light/display-condensed/warm · posture: committed (the navy field carries the hero, the method and the footer; ember stays a signal)

## Tokens
`tokens.css` is the source of truth. The roles:
```css
:root {
  --color-paper: oklch(97.5% 0.006 266);  --color-paper-2: oklch(95% 0.008 266);  --color-paper-3: oklch(92% 0.012 266);
  --color-ink: oklch(18% 0.032 267);  --color-ink-2: oklch(32% 0.03 266);  --color-muted: oklch(48% 0.02 266);  --color-rule: oklch(88% 0.01 266);
  --color-field: oklch(18% 0.032 267);  --color-field-2: oklch(22.1% 0.046 264);  --color-on-field: oklch(96% 0.008 266);  --color-on-field-muted: oklch(78% 0.02 266);
  --color-accent: oklch(72.5% 0.182 46);  --color-accent-ink: oklch(15% 0.021 264);  --color-focus: oklch(62% 0.19 43);
  --font-display: "Barlow Condensed", "Arial Narrow", ui-sans-serif, system-ui, sans-serif;  --font-body: "Barlow", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 8px;  --radius-pill: 999px;  --rule-hair: 1px;  --shadow-card: none;
}
```
The spacing scale, the type scale, the easings and the durations are the scaffold's and live in `tokens.css`.
Ember on paper is 2.4:1: it is a fill (with `--color-accent-ink` text) or a signal on navy, never text or an icon on paper.
Weights: 400 body, 600 strong and item titles, 800 display. No third family.

## Controls
- Primary: ember fill, navy text · pill · 48px; one per page (the nav action is quieter)
- Secondary: outlined in the surface's rule colour · pill · 48px
- Links in running text: underlined; rows of the index are whole-row links

## Motion
- Character: still; no reveal, no background animation; hover is one colour step at --dur-short; under reduced motion everything ends at once.

## Exports
`tokens.css` in this project. Tailwind, DTCG or shadcn blocks are added here on request, per `export-formats.md`.
