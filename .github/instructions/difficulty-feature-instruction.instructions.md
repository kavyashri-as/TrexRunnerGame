---
applyTo: "ui/js/Game.js,ui/js/Obstacle.js,api/src/routes/highscore.js,api/src/routes/stats.js,api/src/dataStore.js"
---

# Difficulty feature contract

- Canonical values are exactly `'easy' | 'medium' | 'hard'`; default is `'medium'` everywhere.
- Speed/size multipliers (easy ×0.7, medium ×1, hard ×1.4) are defined once in `Game.js` — never re-derived elsewhere.
- The API only stores/counts the `difficulty` string; it must never compute or validate multipliers itself.
- Reject unknown difficulty values at the API boundary with `400` — don't silently default them.
- Any new difficulty-aware field added to `db.json` must also appear in `GET /api/stats`.
