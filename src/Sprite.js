import "./Vector2";
import { Vector2, BoundingBox } from "./Vector2";

export class Sprite {
  /**
   * @description handles all sprite loading/rendering
   * 
   * @param {Object} param0 - all options
   * @param {string} param0.resource - image to draw
   * @param {number} param0.frameSize - size of crop of image
   * @param {number} param0.hFrames - horizontal sprite arrangement
   * @param {number} param0.vFrames - vertical sprite arrangement
   * @param {number} param0.frame - which frame to display
   * @param {number} param0.scale - size of image
   * @param {*} param0.position - where in the canvas to draw (top left corner)
   */
  constructor({
    resource,
    frameSize,
    hFrames,
    vFrames,
    frame,
    scale,
  }) {
    this.resource = resource;
    this.frameSize = frameSize ?? new Vector2(16, 16);
    this.hFrames = hFrames ?? 1;
    this.vFrames = vFrames ?? 1;
    this.frame = frame ?? 0;
    this.frameMap = new Map();
    this.scale = scale ?? 1;
    this.buildFrameMap();
  }

  buildFrameMap() {
    let frameCount = 0;
    for (let v = 0; v < this.vFrames; v++) {
      for (let h = 0; h < this.hFrames; h++) {
        this.frameMap.set(
          frameCount,
          new Vector2(h * this.frameSize.x, v * this.frameSize.y)
        );
        frameCount++;
      }
    }
  }

  drawImage(ctx, position, frameIndex = this.frame, scale = this.scale) {
    if (!this.resource.isLoaded) {
      return;
    }

    // find the correct sprite sheet frame to use
    const frame = this.frameMap.get(frameIndex);
    if (frame == null) {
      console.log(`ERROR: INVALID FRAME '${this.frame}' ON ${this}`);
      return;
    }

    ctx.drawImage(
      this.resource.image,
      frame.x,
      frame.y,
      this.frameSize.x,
      this.frameSize.y,
      position.x,
      position.y,
      this.frameSize.x * scale,
      this.frameSize.y * scale
    );
  }
}


export class DraggableSprite {
  constructor({
    sprite,
    frame,
    scale,
    position,
    boundingBox
  }) {
    this.sprite = sprite;
    this.frame = frame;
    this.scale = scale;
    this.position = position;
    this.boundingBox = boundingBox;
  }

  draw(ctx) {
    this.sprite.drawImage(ctx, this.position, this.frame, this.scale);
  }

  isWithinBoundingBox(x, y) {
    return this.boundingBox.isWithinBoundingBox(x, y, this.position);
  }
}

