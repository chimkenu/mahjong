export class Grid {
  constructor({
    xOffset,
    yOffset,
    cellSize,
  }) {
    this.xOffset = xOffset ?? 0;
    this.yOffset = yOffset ?? 0;
    this.cellSize = cellSize;
  }

  toGridCellX(number) {
    return this.xOffset + number * this.cellSize;
  }

  toGridCellY(number) {
    return this.yOffset + number * this.cellSize;
  }

  lerpVectorTo(from, to, step) {
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
