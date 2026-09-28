---
name: trex-code-review
description: Reviews TrexGame Canvas/game-loop code for performance and physics correctness
---

# T-Rex Runner Code Review

When reviewing files under `ui/js/`, always check for:

1. **Frame-rate independence** - movement must use `deltaTime`, never a fixed per-frame step.
2. **Hitbox insets** - collision bounds stay slightly smaller than the sprite, matching existing `getBounds()` patterns.
3. **Cleanup** - off-screen entities must be marked/filtered so arrays don't grow unbounded.
4. **No DOM/canvas mixing** - only `Game.js` touches the DOM; other classes stay canvas-only.

Report findings as a numbered list with file and line references.
