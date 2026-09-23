const express = require('express');
const dataStore = require('../dataStore');

const router = express.Router();
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

router.get('/', (req, res) => {
  res.json({ highScore: dataStore.getHighScore() });
});

router.post('/', (req, res) => {
  const { score, difficulty = 'medium' } = req.body || {};

  if (score === undefined || Number.isNaN(Number(score)) || Number(score) < 0) {
    return res.status(400).json({ error: 'A valid non-negative "score" is required.' });
  }

  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return res.status(400).json({ error: 'A valid "difficulty" of easy, medium, or hard is required.' });
  }

  const result = dataStore.submitScore(score, difficulty);
  res.status(201).json(result);
});

module.exports = router;
