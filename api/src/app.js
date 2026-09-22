const express = require('express');
const cors = require('cors');

const healthRouter = require('./routes/health');
const highscoreRouter = require('./routes/highscore');
const statsRouter = require('./routes/stats');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/health', healthRouter);
  app.use('/api/highscore', highscoreRouter);
  app.use('/api/stats', statsRouter);

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = createApp;
