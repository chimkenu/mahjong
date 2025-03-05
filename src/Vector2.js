export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  static lerpVectorTo(from, to, step) {
    const distX = to.x - from.x;
    const distY = to.y - from.y;
    let dist = Math.sqrt(
      distX ** 2 +
      distY ** 2
    );

    if (dist < step) {
      from.x = to.x;
      from.y = to.y;
      dist = 0;
    } else {
      let normalX = distX / dist;
      let normalY = distY / dist;
      from.x += normalX * step;
      from.y += normalY * step;
      dist = Math.sqrt(
        (to.x - from.x) ** 2 +
        (to.y - from.y) ** 2
      );
    }

    return dist;
  }
}

export class BoundingBox {
  constructor({
    minVec,
    maxVec
  }) {
    this.min = minVec;
    this.max = maxVec;
  }

  isWithinBoundingBox(x, y) {
    return this.min.x < x && x < this.max.x &&
      this.min.y < y && y < this.max.y;
  }
}
