const CACTUS_TYPES = {
  small: { width: 17, height: 35, segments: 1 },
  medium: { width: 25, height: 50, segments: 2 },
  large: { width: 36, height: 60, segments: 3 },
};

/**
 * A single cactus obstacle. Size determines width/height/visual complexity.
 */
class Obstacle {
  constructor(x, groundY, size = 'small') {
    const config = CACTUS_TYPES[size] || CACTUS_TYPES.small;
    this.size = size;
    this.width = config.width;
    this.height = config.height;
    this.segments = config.segments;
    this.x = x;
    this.groundY = groundY;
    this.y = groundY - this.height;
    this.markedForRemoval = false;
  }

  update(deltaTime, speed) {
    this.x -= speed * deltaTime;
    if (this.x + this.width < 0) {
      this.markedForRemoval = true;
    }
  }

  getBounds() {
    const inset = 3;
    return {
      x: this.x + inset,
      y: this.y + inset,
      width: this.width - inset * 2,
      height: this.height - inset * 2,
    };
  }

  intersects(otherBounds) {
    const a = this.getBounds();
    const b = otherBounds;
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#2f7d32';

    const segWidth = Math.max(6, Math.floor(this.width / 3));
    ctx.fillRect((this.width - segWidth) / 2, 0, segWidth, this.height);

    if (this.segments >= 2) {
      ctx.fillRect(0, this.height * 0.3, segWidth, this.height * 0.35);
    }
    if (this.segments >= 3) {
      ctx.fillRect(this.width - segWidth, this.height * 0.15, segWidth, this.height * 0.35);
    }

    ctx.restore();
  }

  static randomSize() {
    const sizes = ['small', 'small', 'medium', 'medium', 'large'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Obstacle;
}
