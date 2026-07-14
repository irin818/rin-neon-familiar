# RIN: Neon Echoes — Chapter 0 architecture

## Integration

`App.tsx` keeps the existing single-page website and activates the game only for `#neon-echoes`. `GameShell` is loaded with `React.lazy`, so the initial website bundle does not include the chapter runtime or its CSS. Exiting replaces the hash with `#home` and restores the existing page without a server route.

## Runtime boundaries

| Layer | Location | Responsibility |
| --- | --- | --- |
| Shell and rendering | `src/game/neon-echoes/components/` | Opening, scene viewport, HUD, dialogue and modal surfaces |
| World state | `src/game/neon-echoes/core/state.ts` | Pure reducer, effects, requirements and chapter progression |
| Content | `src/game/neon-echoes/data/` | Five scene nodes, hotspots, exits, dialogue trees and glyph metadata |
| Game systems | `src/game/neon-echoes/systems/` | Graffiti recognition, acoustic error and rule-based companion hints |
| Persistence | `src/game/neon-echoes/core/saveManager.ts` | Versioned validation, migration, import/export and local storage adapter |
| Browser adapters | `audioManager.ts`, `GameStateProvider.tsx` | Web Audio lifecycle, autosave scheduling and React context |

The content and rules do not require a backend, account, analytics service, canvas engine or WebGL runtime. Scene images resolve through Vite's existing GitHub Pages base path.

## Chapter graph

```text
Neon Balcony
  hand-taken
    -> Service Corridor
       spray-found + Blind Eye + camera-disabled
         -> Signal Gate
            acoustic-gate-open
              -> RIN Safehouse
                 name-response branch + chapter-0-complete
                   -> Rooftop Relay / city map
```

Scene hotspots use normalized 0–100 coordinates. Requirements are evaluated from completed events, missing events, inventory and unlocked graffiti, so renderer layout does not determine game rules.

## Save schema

The local key is `rin-neon-echoes-save`; the current `saveVersion` is `1`. The state contains:

- chapter, current/visited scenes and per-node city status;
- completed events, inventory and unlocked / selected graffiti;
- relationship values, mood, remembered choices and recent events;
- player choice map and capped dialogue history;
- active dialogue position for mid-conversation reloads;
- audio, text, reduced-motion, subtitle and glitch settings;
- start and update timestamps.

Imported JSON is validated and normalized before it reaches React. Unknown scenes and versions are rejected; arrays, numeric ranges, dialogue positions and settings are sanitized. A rejected import leaves the current in-memory progress unchanged, while an unreadable stored save falls back to a clean initial state.

## Input and accessibility

- Pointer and touch: scene parallax, normalized hotspots, graffiti drawing, sliders and all menus.
- Keyboard: focusable hotspots, dialogue choices, `M` map shortcut, `Esc` pause/close and native range control input.
- Motion: system preference and saved reduced-motion mode disable nonessential transitions and glitch motion.
- Semantics: named regions, dialogs, status messages, headings, buttons and live feedback remain available to assistive technology.

## Static deployment

No deployment contract changes are required. The module is emitted as a separate Vite chunk and is served from `/rin-neon-familiar/` by the existing GitHub Pages workflow after the pull request is merged to `main`.
