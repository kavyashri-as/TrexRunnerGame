/**
 * Infinitely scrolling desert ground made of two alternating segments.
 */
class Ground {
  constructor(y, canvasWidth) {
    this.y = y;
    this.canvasWidth = canvasWidth;
    this.segmentWidth = canvasWidth;
    this.x1 = 0;
    this.x2 = canvasWidth;
    this.bumps = this._generateBumps();
  }

  _generateBumps() {
    const bumps = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      bumps.push({
        x: Math.random() * this.segmentWidth * 2,
        width: 10 + Math.random() * 20,
      });
    }
    return bumps;
  }

  update(deltaTime, speed) {
    const dx = speed * deltaTime;
    this.x1 -= dx;
    this.x2 -= dx;

    if (this.x1 + this.segmentWidth <= 0) {
      this.x1 = this.x2 + this.segmentWidth;
    }
    if (this.x2 + this.segmentWidth <= 0) {
      this.x2 = this.x1 + this.segmentWidth;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = '#535353';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.y);
    ctx.lineTo(this.canvasWidth, this.y);
    ctx.stroke();

    ctx.fillStyle = '#8a6d3b';
    [this.x1, this.x2].forEach((baseX) => {
      this.bumps.forEach((bump) => {
        const bx = baseX + bump.x;
        if (bx > -bump.width && bx < this.canvasWidth) {
          ctx.fillRect(bx, this.y + 2, bump.width, 2);
        }
      });
    });
    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Ground;
}
