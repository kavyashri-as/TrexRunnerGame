const createApp = require('./src/app');

const PORT = process.env.PORT || 3000;
const app = createApp();

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`T-Rex Runner API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
