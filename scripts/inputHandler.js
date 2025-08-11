class InputHandler {
  /**
   * Handles all use input;
   * @param {Container} container Main container object.
   */
  constructor (container) {
    this.container = container;
    this.referenceElement = container.element;
    this.mousePos = { x: 0, y: 0 };
    
    this.setListeners();
  }

  get gridMousePos() {
    const boundingBox = this.container.boundingBox;
    const relativeX = this.mousePos.x - boundingBox.left;
    const relativeY = this.mousePos.y - boundingBox.top;

    return {
      x: relativeX / boundingBox.width * this.container.grid.cols,
      y: relativeY / boundingBox.height * this.container.grid.rows
    }
  }

  get normalisedMousePos() {
    const boundingBox = this.container.boundingBox;
    const relativeX = this.mousePos.x - boundingBox.left;
    const relativeY = this.mousePos.y - boundingBox.top;

    return {
      x: relativeX / boundingBox.width,
      y: relativeY / boundingBox.height
    }
  }

  setListeners() {
    document.addEventListener("mousemove", e => {
      this.mousePos = {
        x: e.clientX,
        y: e.clientY
      }
    });
    this.referenceElement.addEventListener("mousedown", e => {
      if (e.button == 2) {
        this.container.removeEdge();
      }
    });
    this.referenceElement.addEventListener('contextmenu', e => {
      e.preventDefault();
    });
    document.addEventListener("keydown", e => {
      switch (e.key) {
        case "1":
          this.container.splitSegment("vertical");
          break;
        case "2":
          this.container.splitSegment("horizontal");
          break;
        case "3":
          console.log(this.container.focusedSegment);
          break;
      }
    });
  }
}