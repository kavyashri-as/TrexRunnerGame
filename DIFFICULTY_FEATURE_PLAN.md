# T-Rex Runner: Difficulty Level Feature Plan

## Overview
Add three difficulty levels (Easy, Medium, Hard) to the T-Rex Runner game with difficulty-based speed/size multipliers and persistent stats tracking per difficulty.

**Canonical difficulty values:** `'easy' | 'medium' | 'hard'` (case-sensitive, exactly as shown)  
**Default difficulty:** `'medium'`

---

## Feature Specification

### Difficulty Multipliers
All multipliers defined once in `Game.js` and never re-derived elsewhere:

| Difficulty | Speed Multiplier | Obstacle Size Multiplier | Example Speed at Score 0 |
|------------|------------------|--------------------------|--------------------------|
| Easy       | 0.7×             | 0.7×                     | 210 px/sec (70% of 300)   |
| Medium     | 1.0×             | 1.0×                     | 300 px/sec (baseline)     |
| Hard       | 1.4×             | 1.4×                     | 420 px/sec (140% of 300)  |

### User Flow
1. **Difficulty Selection Screen** (before game starts):
   - Three buttons: Easy, Medium, Hard
   - Pre-filled in start overlay
   - Persists until player chooses

2. **Game Execution**:
   - Obstacles spawn with difficulty-aware sizes
   - Game speed adjusted by difficulty multiplier
   - All other mechanics unchanged

3. **Score Submission**:
   - Difficulty sent with score POST to `/api/highscore`
   - Tracked in `db.json` under `gamesByDifficulty`

4. **Stats Display**:
   - GET `/api/stats` returns stats including `gamesByDifficulty`

---

## Implementation Plan

### Phase 1: Core Game Logic (UI + Game Classes)

#### 1.1 Update `ui/index.html`
**File:** `ui/index.html`  
**Changes:**
- Add difficulty selection UI in start overlay:
  - Three buttons: Easy, Medium, Hard
  - Radio buttons or button group (display selected state)
  - Move "Start" button below difficulty selector
- Structure:
  ```html
  <div id="start-overlay" class="overlay">
    <h1>T-Rex Runner</h1>
    <p>Select Difficulty</p>
    <div id="difficulty-selector">
      <button id="diff-easy" class="difficulty-btn" value="easy">Easy</button>
      <button id="diff-medium" class="difficulty-btn selected" value="medium">Medium</button>
      <button id="diff-hard" class="difficulty-btn" value="hard">Hard</button>
    </div>
    <p>Press Space, click the canvas, or hit Start to play</p>
    <button id="start-btn" class="restart-btn" type="button">Start</button>
  </div>
  ```

**Tests:** Visual verification only (no unit test for HTML markup)

---

#### 1.2 Update `ui/js/Game.js`
**File:** `ui/js/Game.js`  
**Changes:**
- Add difficulty multiplier constants at class level:
  ```javascript
  static DIFFICULTY_MULTIPLIERS = {
    easy: { speed: 0.7, size: 0.7 },
    medium: { speed: 1.0, size: 1.0 },
    hard: { speed: 1.4, size: 1.4 },
  };
  ```
- Add `difficulty` instance property (default: `'medium'`)
- Add `setDifficulty(value)` method:
  - Validate against `['easy', 'medium', 'hard']`
  - Store `this.difficulty = value`
  - Recalculate base speed: `this.baseSpeed = 300 * DIFFICULTY_MULTIPLIERS[value].speed`
- Call `setDifficulty('medium')` in constructor
- Update `restart()`:
  - Preserve difficulty across restarts
  - Reset to base speed calculated with current difficulty multiplier
- Bind difficulty selector buttons in `_bindEvents()`:
  - Attach click handlers to `#diff-easy`, `#diff-medium`, `#diff-hard`
  - Call `setDifficulty()` on click and update UI (add/remove `selected` class)
- Update `start()`:
  - Validate difficulty is set; default to `'medium'` if not
  - Store selected difficulty in `this.selectedDifficulty` for submission

**Tests:**
- Test `setDifficulty()` validates and rejects unknown values
- Test base speed updated correctly per difficulty:
  - Easy: 300 × 0.7 = 210
  - Medium: 300 × 1.0 = 300
  - Hard: 300 × 1.4 = 420
- Test difficulty persists across restart
- Test difficulty selection button click handlers update UI

---

#### 1.3 Update `ui/js/Obstacle.js`
**File:** `ui/js/Obstacle.js`  
**Changes:**
- Add static method `getScaledSize(size, sizeMultiplier)`:
  - Takes original size (`'small' | 'medium' | 'large'`)
  - Takes `sizeMultiplier` (e.g., 0.7, 1.0, 1.4)
  - Returns new config with scaled `width` and `height`
  - Example: `small` at 0.7× becomes { width: 12, height: 25, ... }
- Update constructor to accept optional `sizeMultiplier` parameter (default: 1.0)
- Apply multiplier when storing width/height
- Update `Game._update()` to pass difficulty size multiplier when spawning obstacles:
  ```javascript
  const sizeMultiplier = Game.DIFFICULTY_MULTIPLIERS[this.difficulty].size;
  const size = Obstacle.randomSize();
  this.obstacles.push(new Obstacle(this.width + 20, this.groundY, size, sizeMultiplier));
  ```

**Tests:**
- Test `getScaledSize()` correctly scales dimensions:
  - Small (17×35) at 0.7× ≈ 12×25
  - Medium (25×50) at 1.4× = 35×70
- Test Obstacle with size multiplier has correct bounds
- Test collision detection unaffected by scaling

---

#### 1.4 Update `ui/js/ApiClient.js`
**File:** `ui/js/ApiClient.js`  
**Changes:**
- Update `submitScore(score, difficulty)` method to accept `difficulty` parameter (default: `'medium'`)
- Include `difficulty` in POST body:
  ```javascript
  async submitScore(score, difficulty = 'medium') {
    return fetch(`${this.baseUrl}/api/highscore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, difficulty }),
    }).then(/* ... */);
  }
  ```

**Tests:**
- Test `submitScore()` includes difficulty in request body
- Test POST to `/api/highscore` with difficulty parameter

---

#### 1.5 Update `ui/js/ScoreManager.js`
**File:** `ui/js/ScoreManager.js`  
**Changes:**
- Add `difficulty` instance property (initialized to `'medium'`)
- Add setter `setDifficulty(value)` to store difficulty
- Update `submitCurrentScore()` to pass `this.difficulty` to `apiClient.submitScore()`:
  ```javascript
  async submitCurrentScore() {
    return this.apiClient.submitScore(this.score, this.difficulty);
  }
  ```
- Game passes difficulty to ScoreManager before starting:
  ```javascript
  // In Game.start()
  this.scoreManager.setDifficulty(this.difficulty);
  ```

**Tests:**
- Test `setDifficulty()` stores value
- Test `submitCurrentScore()` passes difficulty to ApiClient

---

### Phase 2: API & Data Persistence

#### 2.1 Verify `api/src/dataStore.js` Structure
**File:** `api/src/dataStore.js`  
**Status:** Already implemented ✓
- `DEFAULT_DATA` includes `gamesByDifficulty: { easy: 0, medium: 0, hard: 0 }`
- `submitScore(score, difficulty = 'medium')` already:
  - Validates difficulty parameter
  - Increments `data.gamesByDifficulty[difficulty]`
  - Persists to `db.json`

**Tests:** No changes needed; existing tests already cover difficulty submission

---

#### 2.2 Verify `api/src/routes/highscore.js` Validation
**File:** `api/src/routes/highscore.js`  
**Status:** Already implemented ✓
- POST route validates `difficulty` against `['easy', 'medium', 'hard']`
- Rejects unknown values with 400 status and error message
- Passes validated difficulty to `dataStore.submitScore()`

**Tests:** No changes needed; existing tests already cover validation

---

#### 2.3 Verify `api/src/routes/stats.js` Output
**File:** `api/src/routes/stats.js`  
**Status:** Already implemented ✓
- GET `/api/stats` calls `dataStore.getStats()`
- `getStats()` returns object including `gamesByDifficulty`
- Example response:
  ```json
  {
    "gamesPlayed": 5,
    "highScore": 1200,
    "totalScore": 5000,
    "averageScore": 1000,
    "lastPlayed": "2026-09-23T20:58:48.632+05:30",
    "gamesByDifficulty": { "easy": 2, "medium": 2, "hard": 1 }
  }
  ```

**Tests:** No changes needed; existing tests already verify stats output

---

### Phase 3: Styling & UX

#### 3.1 Update `ui/css/style.css`
**File:** `ui/css/style.css`  
**Changes:**
- Add styles for difficulty selector buttons:
  ```css
  #difficulty-selector {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin: 20px 0;
  }

  .difficulty-btn {
    padding: 10px 20px;
    font-size: 14px;
    border: 2px solid #333;
    background: #fff;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .difficulty-btn:hover {
    background: #f0f0f0;
  }

  .difficulty-btn.selected {
    background: #4CAF50;
    color: #fff;
    border-color: #45a049;
  }
  ```

**Tests:** Visual verification only

---

## Testing Strategy

### Unit Tests

#### Game.test.js (new tests)
```
✓ Game.DIFFICULTY_MULTIPLIERS has easy/medium/hard with correct multipliers
✓ setDifficulty validates and rejects unknown values
✓ setDifficulty recalculates baseSpeed correctly
✓ setDifficulty(easy) sets baseSpeed to 210
✓ setDifficulty(hard) sets baseSpeed to 420
✓ difficulty persists across restart()
✓ _bindEvents attaches difficulty button handlers
✓ difficulty selection updates UI (selected class)
```

#### Obstacle.test.js (new tests)
```
✓ getScaledSize scales small obstacle at 0.7×
✓ getScaledSize scales large obstacle at 1.4×
✓ Obstacle constructor accepts sizeMultiplier
✓ Obstacle with sizeMultiplier has correct width/height
✓ Collision detection works with scaled obstacles
```

#### ScoreManager.test.js (new tests)
```
✓ setDifficulty stores difficulty value
✓ submitCurrentScore passes difficulty to ApiClient
```

#### ApiClient.test.js (new tests, if missing)
```
✓ submitScore includes difficulty in POST body
✓ submitScore defaults difficulty to 'medium'
```

### API Tests

#### highscore.test.js (existing + new tests)
```
✓ POST /api/highscore rejects missing difficulty (already tested)
✓ POST /api/highscore rejects invalid difficulty (already tested)
✓ POST /api/highscore accepts easy/medium/hard
✓ POST /api/highscore increments gamesByDifficulty[difficulty]
```

#### stats.test.js (existing + new tests)
```
✓ GET /api/stats returns gamesByDifficulty
✓ GET /api/stats gamesByDifficulty tracks games per difficulty
✓ Multiple difficulties recorded correctly
```

### E2E Tests (if applicable)
```
✓ Player can select difficulty from start overlay
✓ Game speed adjusts based on selected difficulty
✓ Obstacles scale based on selected difficulty
✓ Score submits with selected difficulty
✓ Stats API reflects submitted difficulty
```

---

## Risks & Mitigation

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Difficulty not persisted across sessions | Medium | Stats API already tracks gamesByDifficulty; document that it's per-game, not global preference |
| Player forgets to select difficulty | Low | Default to Medium; start button disabled or grayed out if no selection (optional UI enhancement) |
| Obstacle collisions change with scaling | Medium | Unit tests verify collision detection with scaled obstacles |
| API rejects valid difficulty due to typo | Low | Validate in both UI and API; use enum-like constants |
| Speed/size multipliers applied twice | High | Define multipliers once in Game.js; never re-derive elsewhere |
| Stats calculation errors | Medium | Comprehensive API tests ensure gamesByDifficulty increments correctly |

---

## Files Summary

### Modified Files
1. **ui/index.html** — Add difficulty selector UI
2. **ui/js/Game.js** — Add difficulty multipliers, setDifficulty(), button binding
3. **ui/js/Obstacle.js** — Add size multiplier scaling
4. **ui/js/ApiClient.js** — Pass difficulty in submitScore()
5. **ui/js/ScoreManager.js** — Store and forward difficulty
6. **ui/css/style.css** — Style difficulty selector buttons

### Already Implemented (No Changes)
- **api/src/dataStore.js** — gamesByDifficulty tracking ✓
- **api/src/routes/highscore.js** — Difficulty validation ✓
- **api/src/routes/stats.js** — Stats output ✓

### Test Files (New Tests)
- **tests/unit/Game.test.js** — Multipliers, validation, persistence
- **tests/unit/Obstacle.test.js** — Size scaling, collision
- **tests/unit/ScoreManager.test.js** — Difficulty storage
- **tests/api/highscore.test.js** — Difficulty tracking
- **tests/api/stats.test.js** — Stats output per difficulty

---

## Implementation Order

1. **Update Game.js** (core multiplier logic)
2. **Update Obstacle.js** (size scaling)
3. **Update ApiClient.js & ScoreManager.js** (difficulty transmission)
4. **Update index.html** (UI structure)
5. **Update style.css** (styling)
6. **Add unit tests** (validate logic)
7. **Add API tests** (validate persistence)
8. **Manual E2E verification**

---

## Definition of Done
- [ ] `npm test` passes all unit + API tests
- [ ] Difficulty selection UI renders on start overlay
- [ ] Easy/Medium/Hard buttons update selected state
- [ ] Game speed adjusts by 0.7×/1.0×/1.4× per difficulty
- [ ] Obstacles scale in size per difficulty
- [ ] Difficulty submits with score via POST /api/highscore
- [ ] GET /api/stats includes gamesByDifficulty breakdown
- [ ] `db.json` persists gamesByDifficulty counts correctly
- [ ] All new code follows project style (2-space indent, semicolons, single quotes)
- [ ] No direct edits to `api/data/db.json`
