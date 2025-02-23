export const UP = "UP";
export const DOWN = "DOWN";
export const LEFT = "LEFT";
export const RIGHT = "RIGHT";

export class Input {
  constructor() {
    this.heldDirections = [];
    document.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          this.onMovePressed(UP);
          break;
        case "ArrowDown":
        case "KeyS":
          this.onMovePressed(DOWN);
          break;
        case "ArrowLeft":
        case "KeyA":
          this.onMovePressed(LEFT);
          break;
        case "ArrowRight":
        case "KeyD":
          this.onMovePressed(RIGHT);
          break;
      }
    });
    document.addEventListener("keyup", (event) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          this.onMoveReleased(UP);
          break;
        case "ArrowDown":
        case "KeyS":
          this.onMoveReleased(DOWN);
          break;
        case "ArrowLeft":
        case "KeyA":
          this.onMoveReleased(LEFT);
          break;
        case "ArrowRight":
        case "KeyD":
          this.onMoveReleased(RIGHT);
          break;
      }
    });
  }

  onMovePressed(direction) {
    if (!this.heldDirections.includes(direction)) {
      this.heldDirections.unshift(direction);
    }
  }

  onMoveReleased(direction) {
    const index = this.heldDirections.indexOf(direction);
    if (index > -1) {
      this.heldDirections.splice(index, 1);
    }
  }

  get direction() {
    return this.heldDirections[0]; // nullable
  }
}
