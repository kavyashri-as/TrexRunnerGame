const Obstacle = require('../../ui/js/Obstacle');

describe('Obstacle', () => {
  const groundY = 250;

  test('creates correct dimensions per size', () => {
    const small = new Obstacle(100, groundY, 'small');
    const large = new Obstacle(100, groundY, 'large');
    expect(large.width).toBeGreaterThan(small.width);
    expect(large.height).toBeGreaterThan(small.height);
  });

  test('moves left based on speed', () => {
    const obstacle = new Obstacle(100, groundY, 'small');
    obstacle.update(1, 50);
    expect(obstacle.x).toBe(50);
  });

  test('marks for removal once off-screen', () => {
    const obstacle = new Obstacle(10, groundY, 'small');
    obstacle.update(1, 100);
    expect(obstacle.markedForRemoval).toBe(true);
  });

  test('detects intersection with overlapping bounds', () => {
    const obstacle = new Obstacle(100, groundY, 'medium');
    const overlapping = { x: 100, y: obstacle.y, width: 20, height: 20 };
    expect(obstacle.intersects(overlapping)).toBe(true);
  });

  test('does not detect intersection when far apart', () => {
    const obstacle = new Obstacle(100, groundY, 'medium');
    const farAway = { x: 500, y: 0, width: 20, height: 20 };
    expect(obstacle.intersects(farAway)).toBe(false);
  });

  test('randomSize returns a valid size', () => {
    const size = Obstacle.randomSize();
    expect(['small', 'medium', 'large']).toContain(size);
  });
});
