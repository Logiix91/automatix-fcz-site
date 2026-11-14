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
Hero with checklist, simulator, services (tiles), figures and calculator, step plan, use-case explorer, pricing, about, contact.

## The six use cases (changed 14 Nov: each one now shows a different kind of work)

| Use case | Sector | Example type | Where the content lives |
|---|---|---|---|
| Nieuwe medewerker inwerken | HR | swimlane diagram, by hand / automated | `index.html`, `ob.*` keys in `i18n.js` |
| Transportaanvragen uit de mailbox | Logistiek | marked document | `DEMO[...][0]` in `site.js` |
| Bankbetalingen afletteren | Financiën | payments matched to invoices, table | `RECON` in `site.js` |
| Monteurs inplannen | Installatiebedrijf | day schedule for three engineers | `PLAN` in `site.js` |
| Weekrapportage zonder Excel | Directie | small report with figures and a bar chart | `REPORT` in `site.js` |
| Waar is mijn zending? | Klantenservice | chat with lookup and hand-over | `CHAT` in `site.js` |

Case texts: `u.1`, `u.3`, `u.4`, `u.5`, `x.1` and `x.3` in `i18n.js`. The other entries in `DEMO` (invoice, contract, quote) and the `cases.*` / `x.2` texts are no longer shown; they are kept so they can be switched back in.

## Files
`site.css` is version 4's stylesheet with one block appended at the end ("version 5") that sets this look. `site.js` and the examples are the same as version 4. New texts: `usp.*`, `sim.h`, `sim.lead` in `i18n.js`.

## Going live
Every page carries `<meta name="robots" content="noindex">` and the folder is listed in `../.assetsignore`. To publish this version, copy the folder's contents over the site root and remove that meta tag.
