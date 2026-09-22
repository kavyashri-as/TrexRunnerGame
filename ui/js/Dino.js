/**
 * The player character: handles run-cycle animation and gravity-based jumping.
 */
class Dino {
  constructor(x, groundY) {
    this.x = x;
    this.groundY = groundY;
    this.width = 44;
    this.height = 47;
    this.y = groundY - this.height;

    this.velocityY = 0;
    this.gravity = 2200; // px/s^2
    this.jumpVelocity = -780; // px/s
    this.isJumping = false;

    this.runFrame = 0;
    this.runFrameTimer = 0;
    this.runFrameInterval = 0.1; // seconds per animation frame
  }

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.velocityY = this.jumpVelocity;
    }
  }

  update(deltaTime) {
    if (this.isJumping) {
      this.velocityY += this.gravity * deltaTime;
      this.y += this.velocityY * deltaTime;

      if (this.y >= this.groundY - this.height) {
        this.y = this.groundY - this.height;
        this.velocityY = 0;
        this.isJumping = false;
      }
    } else {
      this.runFrameTimer += deltaTime;
      if (this.runFrameTimer >= this.runFrameInterval) {
        this.runFrameTimer = 0;
        this.runFrame = (this.runFrame + 1) % 2;
      }
    }
  }

  getBounds() {
    // Slightly inset hitbox so near-misses feel fair to the player.
    const inset = 6;
    return {
      x: this.x + inset,
      y: this.y + inset,
      width: this.width - inset * 2,
      height: this.height - inset * 2,
    };
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = '#535353';
    ctx.fillRect(10, 0, 24, 30); // torso
    ctx.fillRect(4, 8, 14, 16); // neck
    ctx.fillRect(28, 6, 12, 10); // head
    ctx.fillRect(38, 8, 6, 4); // snout
    ctx.fillRect(0, 14, 8, 8); // tail

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 9, 2, 2); // eye

    ctx.fillStyle = '#3f3f3f';
    if (this.isJumping) {
      ctx.fillRect(10, 30, 8, 14);
      ctx.fillRect(22, 30, 8, 14);
    } else if (this.runFrame === 0) {
      ctx.fillRect(10, 30, 8, 17);
      ctx.fillRect(22, 30, 8, 10);
    } else {
      ctx.fillRect(10, 30, 8, 10);
      ctx.fillRect(22, 30, 8, 17);
    }

    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dino;
}
