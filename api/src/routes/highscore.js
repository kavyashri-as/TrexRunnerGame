const express = require('express');
const dataStore = require('../dataStore');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ highScore: dataStore.getHighScore() });
});

router.post('/', (req, res) => {
  const { score } = req.body || {};

  if (score === undefined || Number.isNaN(Number(score)) || Number(score) < 0) {
    return res.status(400).json({ error: 'A valid non-negative "score" is required.' });
  }

  const result = dataStore.submitScore(score);
  res.status(201).json(result);
});

module.exports = router;
