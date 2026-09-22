window.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('game-canvas');
  const game = new Game(canvas);
  await game.init();
});
