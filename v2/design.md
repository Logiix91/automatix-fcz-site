# Design: FR Operations, version 2 ("marked document")

A second, separate look. Version 1 lives one folder up and shares nothing with this one except the text in `i18n.js`.

## Idea
The site shows what the software does to a document: an incoming email, invoice or contract on the left, with the recognised parts marked in yellow, and the record it becomes on the right. Anything the software is not sure about is marked red and goes to a person. Yellow marker is the brand device: it is behind "FR" in the logo and under the figures.

## Colour
White `#ffffff`, desk grey `#f0f1f4`, ink `#14151a`, secondary text `#51545e`, rules `#d9dbe1`.
Ultramarine `#2433d6` for buttons and the method block. Marker yellow `#ffe55a` = recognised. Red `#c2321d` = needs a person.

## Type
Source Serif 4 for headings, figures and the wordmark; IBM Plex Sans for everything else. Both self-hosted in `fonts/`.

## Shape
Pill buttons, square document panels, hairline rules. No cards, no gradients. One soft shadow, under the document sheet only.

## Examples
The demo's three documents (transport request, purchase invoice, lease contract) are in `site.js` under `DEMO`, in Dutch and English, with made-up data. The three cases use the `x.*` keys in `i18n.js`.

## Going live
Every page carries `<meta name="robots" content="noindex">` and the folder is listed in `../.assetsignore`. To publish this version, copy the folder's contents over the site root and remove that meta tag.
