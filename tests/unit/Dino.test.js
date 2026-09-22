const Dino = require('../../ui/js/Dino');

describe('Dino', () => {
  const groundY = 250;

  test('starts on the ground and not jumping', () => {
    const dino = new Dino(40, groundY);
    expect(dino.isJumping).toBe(false);
    expect(dino.y).toBe(groundY - dino.height);
  });

  test('jump sets velocity and isJumping', () => {
    const dino = new Dino(40, groundY);
    dino.jump();
    expect(dino.isJumping).toBe(true);
    expect(dino.velocityY).toBeLessThan(0);
  });

  test('does not double jump mid-air', () => {
    const dino = new Dino(40, groundY);
    dino.jump();
    const velocityAfterFirstJump = dino.velocityY;
    dino.jump();
    expect(dino.velocityY).toBe(velocityAfterFirstJump);
  });

  test('gravity pulls dino back to ground', () => {
    const dino = new Dino(40, groundY);
    dino.jump();
    for (let i = 0; i < 200; i++) {
      dino.update(1 / 60);
    }
    expect(dino.isJumping).toBe(false);
    expect(dino.y).toBe(groundY - dino.height);
  });

  test('getBounds returns an inset hitbox within the sprite bounds', () => {
    const dino = new Dino(40, groundY);
    const bounds = dino.getBounds();
    expect(bounds.x).toBeGreaterThan(dino.x);
    expect(bounds.width).toBeLessThan(dino.width);
  });
});
