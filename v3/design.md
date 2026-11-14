# Design: FR Operations, version 3 ("control room")

A third, separate look. Versions 1 (site root) and 2 (`../v2`) are untouched; only the text in `i18n.js` is shared.

## Idea
The site behaves like the thing being sold: a running automation you can watch and operate. The first screen is a simulator in which made-up orders move through five stages. About three in ten are held with a reason and wait in a queue until the visitor approves them or sends them back. A calculator and a clickable six-phase pipeline follow the same console language.

## Colour
Graphite `#1f2329` / `#181b20`, panels `#272c34` / `#2f353f`, lines `#3b424e`, text `#e9ecf1`, secondary `#a4adbb`.
Status colours are used only for what they name: blue `#4cc2ff` = software is working on it, green `#6fdc8c` = done, amber `#ffb224` = a person has to act. Amber is therefore also the colour of every button that asks the visitor to do something.

## Type
Red Hat Display (headings), Red Hat Text (running text), Red Hat Mono (everything the system "says": order numbers, log, figures, pane titles). All three self-hosted in `fonts/`.

## Logo
Three status bars (blue, green, amber) and "FR Operations" in Red Hat Display.

## Interactive parts (all in `site.js`)
- Simulator: `[data-sim]`. Pause, single-step and fast controls; pauses when off screen or in a background tab; starts paused for visitors who ask for reduced motion. Its Dutch and English strings are in the `T` object.
- Calculator: `[data-calc]`. Orders per day x minutes per order / 60 x 21 working days = hours per month; x 12 x hourly cost = cost per year, rounded to 100.
- Method pipeline and nothing else uses the generic tabs code.

## Going live
Every page carries `<meta name="robots" content="noindex">` and the folder is listed in `../.assetsignore`. To publish this version, copy the folder's contents over the site root and remove that meta tag.
