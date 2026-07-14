# Visual design handoff

The accepted desktop concept is [`approved-hero-concept.png`](./approved-hero-concept.png) at the native review viewport of **1586 × 992**. The final implementation was captured at the same CSS-pixel viewport and compared directly against this source.

## Locked visual system

- User-supplied RIN artwork is the only character source. No additional protagonist was introduced.
- Palette: near-black field, acid green primary signal, violet secondary status, off-white editorial type.
- Composition: 92 px command header, left editorial copy block, right 2:1 artwork field, circular sync control, 78 px system rail.
- Treatments: thin HUD lines, chamfered buttons, mono microcopy, condensed display type, restrained scan/grid texture.
- The character art is not tinted. Only the left-edge mask and native section framing are applied so the supplied image remains recognizable.

## Approved above-the-fold copy

`RIN / 00`, `HOME`, `STORY`, `ARCHIVE`, `SIGNAL GAME`, `SOUND OFF`, `中 / EN`, `RIN · NEON FAMILIAR`, `与 RIN 同频`, the supplied mission sentence, `进入频道`, `查看档案`, `TAP TO SYNC`, and the three system-status labels.

## Fidelity ledger

| Checkpoint | Concept target | Final render | Resolution |
| --- | --- | --- | --- |
| Global frame | 1586 × 992, header and bottom rail close the composition | 1586 × 992; header 92 px; status rail 78 px | Exact review viewport and fixed rails retained |
| Art boundary | Artwork begins just right of the copy field and fills the right side | x 505.38, y 92, 1062.62 × 822 px | Matches the concept's dominant right-hand image mass |
| Editorial heading | Oversized mixed Chinese/RIN line, high in the left field | x 94.70, y 287.04, 540.66 × 107.91 px | Display size and three-part rhythm tuned after comparison |
| Supporting copy | Two readable lines below the title | x 101.53, y 479.95, width 480 px | Vertical offset increased to reproduce the concept's breathing room |
| Primary action | Acid block under the mission sentence | x 97.53, y 587.88, 392 × 82 px | Button height, width and chamfer align to the reference hierarchy |
| Sync control | Circular signal core over the lower-right artwork | x 1386.77, y 740.76, 158 × 158 px | Ring scale and label placement retained without covering the face |
| Status system | Three horizontally distributed chips at the bottom | y 914, height 78 px | Chip geometry and separators simplified for live responsive behavior |
| Copy diff | All approved copy visible without replacement | Exact approved strings confirmed in the rendered DOM | `SOUND OFF` is retained from the user's original UI reference |

## Intentional deviations

- The bottom status chips use simpler scalable polygons than the raster concept so they remain readable across breakpoints.
- Rabbit signals are code-drawn abstract game markers, not additional characters.

## Neon Echoes Chapter 0 concepts

The game module was guided by two additional native **1672 × 941** review concepts:

- [`neon-echoes-exploration-concept.png`](./neon-echoes-exploration-concept.png): scene exploration, hotspot, HUD and inventory hierarchy.
- [`neon-echoes-acoustic-concept.png`](./neon-echoes-acoustic-concept.png): waveform matching, dual-parameter controls and success action hierarchy.

Both are retained as design evidence only. The live module uses the supplied production assets in `public/assets/` and code-rendered UI; no generated character pixels ship to the website.

### Chapter 0 fidelity ledger

| Checkpoint | Concept target | Final render | Resolution |
| --- | --- | --- | --- |
| Character boundary | Recognizable supplied green / pink RIN channels only | Every scene background maps to one of the four supplied RIN derivatives | No generated or unrelated character is rendered |
| Exploration frame | Full-bleed rain-darkened art, top mission, right relationship trace, bottom tools | Fixed scene viewport with normalized hotspots, scan/rain layers and four-corner HUD | Hierarchy retained while scaling from 1672 × 941 to 390 × 844 |
| Reality Graffiti | Three-slot tool rail with a usable Blind Eye | Three data-defined glyphs; Blind Eye unlocks, recognizes a closed trace and disables the watcher | Live canvas replaces the concept's static tool card |
| Acoustic key | Two overlaid waves, frequency / phase controls and dominant sync action | Deterministic SVG waveform comparison, two sliders, step controls and ≤8% completion threshold | Control grammar and acid/pink wave contrast retained |
| Copy and chapter flow | Chapter label, action objective, signal trace and short companion prompts | Chinese / English copy is data-driven across five nodes and three safehouse choices | Copy was rewritten for the implemented scene graph, not copied from raster text |

### Chapter 0 intentional deviations

- The exploration concept shows a bespoke corridor composition. The live build reuses the approved supplied images with crop, depth and color treatments so the public asset boundary remains auditable.
- HUD panels collapse and hide secondary labels on small screens; interaction targets and the current objective remain visible.
- The acoustic interface uses vector waveforms and native range controls for keyboard, touch and reduced-motion support instead of rasterized controls.
