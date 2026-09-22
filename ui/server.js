const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 8081;
const app = express();

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`T-Rex Runner UI listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
