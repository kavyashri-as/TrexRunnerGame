## Project Overview
T-Rex Runner: an HTML5 Canvas game (`ui/`) backed by an Express REST API (`api/`) for high scores and stats, persisted to a JSON file.

## Setup Commands
- Install dependencies: `npm install`
- (Optional, only for E2E) install browsers: `npx playwright install`

## Run
- Both servers: `npm start`
- API only (port 3000): `npm run start:api`
- UI only (port 8081): `npm run start:ui`

## Repository Structure
- `api/src/` — Express app, routes, JSON data store
- `ui/js/` — ES6 game classes (Dino, Obstacle, Cloud, Ground, Game)
- `tests/unit/` — Jest, game class logic
- `tests/api/` — Jest + Supertest, REST routes
- `tests/e2e/` — Playwright, full game flow

## Testing Instructions
- Unit: `npm run test:unit`
- API: `npm run test:api`
- Both: `npm test`
- E2E (auto-starts both servers): `npm run test:e2e`
- Always add/update a test for any behavior change before considering a task done.

## Code Style
- 2-space indent, semicolons, single quotes.
- Game classes: one class per file, only `update(deltaTime, ...)` + `draw(ctx)` methods.
- API: validate request bodies in routes; persist only through `dataStore.js`.

## Definition of Done
- [ ] `npm test` passes
- [ ] New/changed behavior has a matching test
- [ ] No direct edits to `api/data/db.json`
