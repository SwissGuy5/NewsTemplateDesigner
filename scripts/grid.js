class Grid {
  constructor (parent, element) {
    this.parent = parent;
    this.element = element;
    this.rows = 44;
    this.cols = 32;
    
    this.updateGridTemplate();
  }

  get gridMinGap() {
    return 1 / 2;
  }

  get relativeMinGap() {
    const gridSize = this.parent.boundingBox.height / this.rows;
    return gridSize / 2;
  }

  /**
   * Draws the grid and its elements
   */
  updateGridTemplate() {
    this.element.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
    this.element.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

    this.element.innerHTML = "";
    for (let i = 0; i < this.rows * this.cols; i++) {
      this.element.appendChild(document.createElement('div'));
    }   
  }
}