# Orbit — curated profile guide

Orbit is a browser-only companion for Yashveer’s public profile lab. It uses deterministic question matching against `knowledge.json`. It is not an AI model and does not read private repositories, conversations, or visitor accounts.

## Behavior

- Animated SVG robot, with idle, wave, reading, happy, and curious expressions.
- Questions about public background, projects, stack, stage, demos, roadmap, and contact.
- Brief project follow-ups retain the last matched project in memory.
- Developer/collaborator audience routes adjust project overviews.
- Answer links navigate through the same lab state used by the page controls.
- Unknown or private questions get an explicit fallback; no invented facts.
- No auto-open, audio, tracking, or transcript storage. Only the hide preference uses localStorage.
- Escape closes the non-modal panel. Focus returns to its launcher. Reduced motion disables animations.

## Updating approved answers

Edit `knowledge.json`, review the facts against the public README and project notes, and update its `reviewed` date. Do not copy private chat history or private source into this public file. Keep project-stage notes and demo limitations explicit. The guide does not automatically ingest changing project notes; it uses this reviewed snapshot.

`engine.js` implements matching and returns text, links, suggested questions, and a project context. `pet.js` renders all question and answer text with textContent. Internal navigation uses the `profile-guide:navigate` event handled by the main app. External action links are restricted to GitHub and LinkedIn. An unavailable knowledge file produces a retry message.

This is the first version. Voice, model-based answers, permanent conversation memory, and activity-dependent behavior are not implemented.
