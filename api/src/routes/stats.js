const express = require('express');
const dataStore = require('../dataStore');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(dataStore.getStats());
});

module.exports = router;
