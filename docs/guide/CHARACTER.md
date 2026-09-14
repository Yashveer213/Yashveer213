# Orbit 02 — character design

**Role:** Yashveer’s calm, curious lab companion. Explains public work and helps visitors find useful demonstrations.

## Form and materials

- A broad, rounded ceramic head floats above a compact graphite body. The silhouette should remain legible at 130–170 CSS pixels.
- Warm ceramic shell (#d6c7bf), graphite frame (#333a49), brushed copper trim (#cf8169), deep navy visor (#091423), mint eyes (#b7f9ec), and an amber antenna light.
- The front visor is layered in actual 3D: ceramic shell, raised copper surround, curved dark glass surface, separate luminous eyes and mouth.
- Ear drums, temple accents, a small offset antenna, a illuminated chest core, shoulder pivots, capsule forearms, rounded hands, and two stabilizer feet complete the body.
- Two thin rings beneath the character suggest a hover dock. The character has physical mesh geometry, perspective, metallic lighting and depth, rendered with WebGL through a locally vendored Three.js 0.180.0.
- Three lights provide a soft neutral fill, warm front light, and cool rim light. No borrowed ASUS artwork or model is used.

## Expressions and motion

| State | Body language |
| --- | --- |
| Idle | Gentle vertical hover and infrequent blinking |
| Greeting | Right arm raises and waves |
| Reading | Eyes lower toward the question field |
| Thinking | Chest/eye illumination gently pulses while a response is being retrieved |
| Happy | Small head nod and softer eye shape |
| Curious | Slight head tilt when a question needs clarification |
| Presenting | Left arm opens toward the content during navigation or tours |

Pointer movement over the character subtly turns its head and body. A separate drag handle repositions the dock without confusing a click with a drag. Double-click the handle to reset. Mobile uses a fixed dock. Reduced-motion preference stops timed animation; visibility checks pause rendering in hidden tabs and offscreen views. If WebGL or its module cannot load, a simple Orbit emblem keeps the guide usable.

## Interface

A compact dock expands into a conversation workspace. The larger character shares the header with a brief introduction and guided-tour entry. Answers have explicit mode labels and can include project cards with stage and technology chips. The active project stays visible in the session bar. Clear session removes the in-memory history and active tour. No conversation is persisted to disk.

## Knowledge and AI boundary

Local responses use curated matching, minor spelling normalization, short follow-ups, topic context, project cards, and three tours. The separate model integration may improve wording and follow-ups only after its backend is activated. Both modes are limited to the reviewed public knowledge file. AI-generated answers are identified as such and do not execute page actions.
