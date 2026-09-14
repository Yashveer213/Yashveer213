# Orbit 2

The animated profile guide includes an original 3D character, contextual public answers, project cards, and guided tours. See [CHARACTER.md](CHARACTER.md) for its design specification.

## Front end

- `avatar.js`: procedural Three.js model, lights, articulated expressions and visibility/reduced-motion handling.
- `pet.js` / `pet.css`: dock, drag control, conversation panel, cards, tours and optional AI mode.
- `engine.js`: context, normalization and structured answers; `engine-v1.js`: curated fallback matching.
- `knowledge.json`: explicitly reviewed public facts. Edit this file to expand the guide; never paste private conversation history.
- `config.json`: optional deployed backend URL. Empty URL + `modelEnabled:false` keeps all questions local.
- `three.module.min.js`, `three.core.min.js`: Three.js 0.180.0, vendored with its MIT license. No CDN dependency for the character.

The active project, recent six exchanges and up to four project interests stay in memory only. Clear session resets them. With AI mode enabled by a visitor, the last four exchanges are sent to the configured Worker; that Worker discards earlier answer text before inference. The hide preference alone is kept in localStorage. Drag position lasts until resize or reload.

The recovery tour runs the same visible demo controls as a visitor. Each simulated change requires pressing Run this step. Navigating between steps preserves the current demo state.

The backend deployment instructions live in [backend/README.md](../../../backend/README.md) in the repository. Activation requires a Cloudflare account and a verified deployed endpoint. Do not label local answers as AI answers.
