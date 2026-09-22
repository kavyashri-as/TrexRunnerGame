const Cloud = require('../../ui/js/Cloud');

describe('Cloud', () => {
  test('moves left over time', () => {
    const cloud = new Cloud(100, 30);
    const startX = cloud.x;
    cloud.update(1, 900);
    expect(cloud.x).toBeLessThan(startX);
  });

  test('wraps around to the right once off-screen', () => {
    const cloud = new Cloud(-100, 30);
    cloud.update(0, 900);
    expect(cloud.x).toBeGreaterThan(900);
  });
});
