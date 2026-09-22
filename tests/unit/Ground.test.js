const Ground = require('../../ui/js/Ground');

describe('Ground', () => {
  test('scrolls both segments left', () => {
    const ground = new Ground(250, 900);
    const startX1 = ground.x1;
    ground.update(1, 100);
    expect(ground.x1).toBe(startX1 - 100);
  });

  test('recycles a segment once it is fully off-screen', () => {
    const ground = new Ground(250, 900);
    // Simulate ~10 seconds of realistic per-frame updates (as the game loop would call it).
    for (let i = 0; i < 200; i++) {
      ground.update(0.05, 300);
    }
    expect(ground.x1).toBeGreaterThan(-900);
    expect(ground.x2).toBeGreaterThan(-900);
  });
});
