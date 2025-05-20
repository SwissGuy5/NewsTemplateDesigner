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

  get relativeMousePos() {
    const boundingBox = this.referenceElement.getBoundingClientRect();
    return {
      x: this.mousePos.x - boundingBox.left,
      y: this.mousePos.y - boundingBox.top
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
          this.container.focusedSegment;
          break;
      }
    });
  }
}