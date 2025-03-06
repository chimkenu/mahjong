import { Vector2 } from './Vector2.js';

export class Input {
  constructor({
    canvas,
    onDraw,
    onDiscard,
    onPong,
    onMahjong,
    draggables,
  }) {
    document.getElementById('draw-button').addEventListener('click', () => {
      console.log('Draw button clicked');
      onDraw();
    });

    document.getElementById('discard-button').addEventListener('click', () => {
      console.log('Discard button clicked');
      onDiscard();
    });

    document.getElementById('pong-button').addEventListener('click', () => {
      console.log('Pong button clicked');
      onPong();
    });

    document.getElementById('mahjong-button').addEventListener('click', () => {
      console.log('Mahjong button clicked');
      onMahjong();
    });

    this.draggables = draggables;
    this.draggable = null;
    this.isDragging = false;
    this.getDragPosition = function(event) {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      return new Vector2(x, y);
    }

    this.onDragStart = function(dragPos) {
      if (this.isDragging) {
        return;
      }
      for (const draggable of this.draggables) {
        if (draggable.isWithinBoundingBox(dragPos.x, dragPos.y)) {
          this.draggable = draggable;
          this.isDragging = true;
          this.dragOffset = new Vector2(dragPos.x - draggable.position.x, dragPos.y - draggable.position.y);
          break;
        }
      }
      if (this.draggable != null) {
        // move draggable to top of draggables
        this.draggables.splice(this.draggables.indexOf(this.draggable), 1);
        this.draggables.unshift(this.draggable);
      }
    }

    this.onDragMove = function(dragPos) {
      if (this.isDragging) {
        this.draggable.position.x = dragPos.x - this.dragOffset.x;
        this.draggable.position.y = dragPos.y - this.dragOffset.y;
      }
    }

    this.onDragEnd = function() {
      this.isDragging = false;
      this.draggable = null;
    }

    // Handle drag start event
    canvas.addEventListener('mousedown', (e) => {
      this.onDragStart(this.getDragPosition(e));
    });
    canvas.addEventListener('touchstart', (e) => {
      this.onDragStart(this.getDragPosition(e.touches[0]));
    });

    // Handle drag move event
    canvas.addEventListener('mousemove', (e) => {
      this.onDragMove(this.getDragPosition(e));
      e.preventDefault();
    });
    canvas.addEventListener('touchmove', (e) => {
      this.onDragMove(this.getDragPosition(e.touches[0]));
      e.preventDefault();
    });

    // Handle drag end event
    canvas.addEventListener('mouseup', () => {
      this.onDragEnd();
    });
    canvas.addEventListener('touchend', () => {
      this.onDragEnd();
    });
  }
}

