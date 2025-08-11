class Grid {
  constructor (parent, element) {
    this.parent = parent;
    this.element = element;
    this.gridMultiplier = 2;
    this.rows = 22 * this.gridMultiplier;
    this.cols = 16 * this.gridMultiplier;
    
    this.updateGridTemplate();
  }

  get minGap() {
    const gridSize = this.parent.boundingBox.height / this.rows;
    return gridSize / 2;
  }

  snapToGrid(dimensions) {
    const containerBoundingBox = this.parent.boundingBox;
    const gridSize = {
      x: containerBoundingBox.width / this.cols,
      y: containerBoundingBox.height / this.rows
    };
    const gridDimensions = {
      x: Math.round(dimensions.x / (gridSize.x)),
      y: Math.round(dimensions.y / (gridSize.y)),
    };
    return {
      x: gridDimensions.x * gridSize.x,
      y: gridDimensions.y * gridSize.y
    }
  }

  updateGridTemplate() {
    this.element.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
    this.element.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

    this.element.innerHTML = "";
    for (let i = 0; i < this.rows * this.cols; i++) {
      this.element.appendChild(document.createElement('div'));
    }   
  }
}