# T-Rex Runner

A Chrome Dino-inspired infinite runner built with HTML5 Canvas, vanilla ES6+ JavaScript, and a Node.js/Express REST API for persistent high scores and stats.

## 1. Functional Requirements

- Infinite side-scrolling runner with procedurally spawned obstacles.
- Dino character with **run** (2-frame leg animation) and **jump** (gravity/velocity) states.
- Jump input via **Spacebar** or **Arrow Up**; also supports a canvas click.
- Small / medium / large cactus obstacles spawned at randomized intervals.
- AABB collision detection between the dino's hitbox and obstacles.
- Live score counter that increases with distance traveled; game speed ramps up over time.
- Persisted high score, fetched on load and submitted on game over.
- Game Over overlay with a **Restart** button (and Space/Up to restart).
- Blue sky gradient background with parallax-scrolling clouds.
- Scrolling desert ground with randomized surface bumps.
- Responsive layout that scales the canvas to the viewport while preserving aspect ratio.

## 2. UI Design

- **Layout**: centered card (`.game-container`) with a HUD (high score + score), the game canvas, a centered Game Over overlay, and jump instructions below.
- **Visual style**: soft dark page backdrop, white rounded card with shadow, monospace HUD digits (classic Dino-style padded score), green gradient "Restart" pill button with hover lift.
- **Canvas rendering**: sky gradient (`#87ceeb` → `#e0f6ff`), soft white ellipse-cloud clusters, brown ground bumps on a horizon line, dark-grey vector dino, green segmented cacti.
- **Responsiveness**: canvas uses `width: 100%` with a fixed `aspect-ratio`, so it resizes fluidly on smaller screens while game logic still operates on the fixed internal resolution (900×300).

## 3. API Specification

Base URL: `http://localhost:3000/api`

| Method | Path              | Description                                  | Body                | Response                                              |
|--------|-------------------|-----------------------------------------------|----------------------|--------------------------------------------------------|
| GET    | `/api/health`     | Service health check                          | –                     | `{ "status": "ok", "timestamp": "<ISO date>" }`         |
| GET    | `/api/highscore`  | Current persisted high score                  | –                     | `{ "highScore": number }`                              |
| POST   | `/api/highscore`  | Submit a run's score; updates high score if greater | `{ "score": number }` | `{ "highScore": number, "isNewHighScore": boolean }`   |
| GET    | `/api/stats`      | Aggregate gameplay statistics                 | –                     | `{ "gamesPlayed", "highScore", "totalScore", "averageScore", "lastPlayed" }` |

Validation: `POST /api/highscore` returns `400` if `score` is missing, non-numeric, or negative.

Data is persisted to `api/data/db.json` and survives server restarts.

## 4. Folder Structure

```
TrexRunnerGame/
├── api/                     # Express REST API (port 3000)
│   ├── data/
│   │   └── db.json          # persisted scores & stats
│   ├── src/
│   │   ├── app.js           # Express app factory (routes, middleware)
│   │   ├── dataStore.js     # JSON-file persistence layer
│   │   └── routes/
│   │       ├── health.js
│   │       ├── highscore.js
│   │       └── stats.js
│   └── server.js            # entry point (listens on PORT/3000)
├── ui/                      # Static Canvas game (port 8081)
│   ├── css/style.css
│   ├── js/
│   │   ├── ApiClient.js
│   │   ├── ScoreManager.js
│   │   ├── Dino.js
│   │   ├── Obstacle.js
│   │   ├── Cloud.js
│   │   ├── Ground.js
│   │   ├── Game.js
│   │   └── main.js
│   ├── index.html
│   └── server.js            # static file server (entry point)
├── tests/
│   ├── unit/                # Jest unit tests for game classes
│   ├── api/                 # Supertest API tests
│   └── e2e/                 # Playwright end-to-end tests
├── jest.config.js
├── playwright.config.js
├── package.json
└── README.md
```

## 5. Source Code

See `api/` and `ui/` folders. Key classes (all in `ui/js/`):

- **`ApiClient`** – fetch wrapper for the 4 REST endpoints; fails soft to local defaults.
- **`ScoreManager`** – tracks live score, formats HUD digits, syncs high score with the API.
- **`Dino`** – run/jump animation state machine, gravity physics, hitbox.
- **`Obstacle`** – small/medium/large cacti, movement, AABB collision.
- **`Cloud`** – parallax background clouds with wraparound.
- **`Ground`** – dual-segment infinite scrolling ground.
- **`Game`** – game loop (`requestAnimationFrame`), input binding, spawning, collision checks, HUD/API sync, restart flow.

## 6. Test Cases

- **Unit tests** (`tests/unit`, Jest): jump physics, gravity settle, hitbox insets, obstacle sizing/collision/off-screen removal, cloud parallax/wraparound, ground scroll/recycle, score accumulation/formatting/high-score sync.
- **API tests** (`tests/api`, Jest + Supertest): health check shape, high score GET/POST (including validation and "never decreases"), stats aggregation (games played, total/average score, timestamps).
- **E2E tests** (`tests/e2e`, Playwright): canvas + HUD render on load, Space starts the game and increases score, restart button is present.

Run:

```bash
npm run test:unit   # Jest unit tests
npm run test:api     # Jest + Supertest API tests
npm test             # unit + api
npm run test:e2e     # Playwright (auto-starts API + UI servers)
```

## 7. Run Instructions

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Install Playwright browsers, needed only for E2E tests
npx playwright install

# 3. Run both servers together
npm start

# ...or run them individually
npm run start:api   # http://localhost:3000
npm run start:ui    # http://localhost:8081
```

Open **http://localhost:8081** in a browser and press **Space** / **Arrow Up** to play.

The API persists scores/stats to `api/data/db.json`, so your high score survives server restarts.
