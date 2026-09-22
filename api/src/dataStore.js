const fs = require('fs');
const path = require('path');

// Overridable via env var so parallel test workers can use isolated data files.
const DB_PATH = process.env.TREX_DB_PATH || path.join(__dirname, '..', 'data', 'db.json');

const DEFAULT_DATA = {
  highScore: 0,
  gamesPlayed: 0,
  totalScore: 0,
  lastPlayed: null,
};

function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

function readData() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch (err) {
    return { ...DEFAULT_DATA };
  }
}

function writeData(data) {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getHighScore() {
  return readData().highScore;
}

function submitScore(score) {
  const data = readData();
  const numericScore = Number(score) || 0;
  data.gamesPlayed += 1;
  data.totalScore += numericScore;
  data.lastPlayed = new Date().toISOString();

  const isNewHighScore = numericScore > data.highScore;
  if (isNewHighScore) {
    data.highScore = numericScore;
  }

  writeData(data);
  return { highScore: data.highScore, isNewHighScore };
}

function getStats() {
  const data = readData();
  const averageScore = data.gamesPlayed > 0 ? Math.round(data.totalScore / data.gamesPlayed) : 0;
  return {
    gamesPlayed: data.gamesPlayed,
    highScore: data.highScore,
    totalScore: data.totalScore,
    averageScore,
    lastPlayed: data.lastPlayed,
  };
}

// Used by tests to guarantee a clean, deterministic state between assertions.
function resetData() {
  writeData({ ...DEFAULT_DATA });
}

module.exports = {
  readData,
  writeData,
  getHighScore,
  submitScore,
  getStats,
  resetData,
  DB_PATH,
};
