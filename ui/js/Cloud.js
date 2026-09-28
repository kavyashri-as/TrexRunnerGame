/**
 * Decorative background cloud with parallax scrolling (slower than the ground).
 */
class Cloud {
  static MIN_PARALLAX_SPEED = 15; // px/sec
  static PARALLAX_SPEED_VARIANCE = 10; // px/sec, added on top of MIN_PARALLAX_SPEED

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 60 + Math.random() * 30;
    this.height = 20;
    this.speed = Cloud.MIN_PARALLAX_SPEED + Math.random() * Cloud.PARALLAX_SPEED_VARIANCE;
  }

  update(deltaTime, canvasWidth) {
    this.x -= this.speed * deltaTime;
    if (this.x + this.width < 0) {
      this.x = canvasWidth + Math.random() * 200;
      this.y = 20 + Math.random() * 60;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.ellipse(this.x + this.width * 0.3, this.y + this.height * 0.5, this.width * 0.3, this.height * 0.5, 0, 0, Math.PI * 2);
    ctx.ellipse(this.x + this.width * 0.55, this.y + this.height * 0.35, this.width * 0.25, this.height * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(this.x + this.width * 0.75, this.y + this.height * 0.5, this.width * 0.22, this.height * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Cloud;
}
