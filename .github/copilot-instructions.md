# Copilot Instructions — T-Rex Runner
## Architecture
- `ui/` — vanilla ES6 Canvas game, no bundler, classes loaded via `<script>` tags.
- `api/` — Express REST API (`api/src/app.js`), routes in `api/src/routes/`, persisted via `dataStore.js` to `api/data/db.json`.
- Data flow: UI → `ApiClient.js` → Express routes → `dataStore.js` → `db.json`.

## Policies	
- Validate all external input in API routes before writing to `dataStore.js`; reject bad data with `400`.
- Comments state only what the code can't show, in one line.
- Every behavior change needs a test: `npm run test:unit` or `npm run test:api` before it's done.
- Style: 2-space indent, semicolons, single quotes, matching existing files.

