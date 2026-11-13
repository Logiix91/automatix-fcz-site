# Design: FR Operations, version 5 (sober Dutch business style)

The same content and examples as version 4, in the plain, light style of an established Dutch service company. Versions 1 to 4 are untouched.

## What makes it read as Dutch and not as a tech start-up
- White pages with light blue-grey bands, flat panels with a 1px border, no gradients or glow.
- One deep blue `#14406f` for headings, the top bar and the footer; one yellow `#ffc917` used only for the button that asks for the consultation. Links are blue `#1d5fa8` and underlined.
- One humanist typeface, Source Sans 3, at 18px. No monospace, no uppercase labels, no display font.
- A thin top bar with the tagline and email address above the menu.
- A checklist of what the visitor can expect, next to the headline. Each point comes from text already on the site (free consultation, cost known up front, founders build it themselves, AVG and EU AI Act, reply within one working day).
- The method as a numbered step plan with everything visible, instead of tabs.
- A dark blue footer with underlined links and the KVK line.

## Colour code in the examples (unchanged from version 4, darker for white)
Blue = software, orange-brown `#b35c00` = a person has to act, green `#1a7f4b` = done.

## Structure of the home page
Hero with checklist, simulator, services (tiles), figures and calculator, step plan, use-case explorer (six cases, see `../v4/design.md` for where each example's content lives), pricing, about, contact.

## Files
`site.css` is version 4's stylesheet with one block appended at the end ("version 5") that sets this look. `site.js` and the examples are the same as version 4. New texts: `usp.*`, `sim.h`, `sim.lead` in `i18n.js`.

## Going live
Every page carries `<meta name="robots" content="noindex">` and the folder is listed in `../.assetsignore`. To publish this version, copy the folder's contents over the site root and remove that meta tag.
