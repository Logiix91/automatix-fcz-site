# Design: FR Operations, version 4 (the console, with every example)

Version 3's look, plus the examples from versions 1 and 2, organised by use case. Versions 1 (site root), 2 (`../v2`) and 3 (`../v3`) are untouched.

## What is on the home page
1. Hero with the order-pipeline simulator (from version 3).
2. Services.
3. Use-case explorer (`#cases`): six processes in a list; picking one shows its before/after text and one example.

   | Use case | Example type | Where the content lives |
   |---|---|---|
   | Order naar factuur | swimlane diagram, by hand / automated | `index.html`, `flow.*` keys in `i18n.js` |
   | Transportaanvragen uit de mailbox | marked document | `DEMO[...][0]` in `site.js` |
   | Factuurcontrole | marked document | `DEMO[...][1]` |
   | Clausules uit contracten | marked document | `DEMO[...][2]` |
   | Offerteaanvragen beantwoorden | marked document | `DEMO[...][3]` |
   | Waar is mijn zending? | chat with lookup and hand-over | `CHAT` in `site.js` |

   Case texts: `cases.1` to `cases.3` and `x.1` to `x.3` in `i18n.js`.
4. Market figures and the calculator, method pipeline, pricing, about, contact.

## One colour code everywhere
Blue = software did or recognised it. Amber = a person has to act. Green = done. This holds in the simulator, the diagram (amber dashed steps are manual work), the documents (blue marks recognised, amber marks go to an employee), the chat (amber line = handed over) and the buttons.

## Adding a use case
Add a tab button and a panel in `#cases` following the existing pattern, add its texts to both languages in `i18n.js`, and for a document example append one entry to both `DEMO.nl` and `DEMO.en` and set `data-demo` to its position.

## Going live
Every page carries `<meta name="robots" content="noindex">` and the folder is listed in `../.assetsignore`. To publish this version, copy the folder's contents over the site root and remove that meta tag.
