class Grid {
  /**
   * The grid object.
   * @param {Container} parent The parent container object 
   * @param {Element} element  The DOM grid element
   */
  constructor (parent, element) {
    this.parent = parent;
    this.element = element;
    this.rows = 44;
    this.cols = 32;
    
    this.updateGridTemplate();
  }

  // Get the maximum distance before an edge is considered too far.
  get gridMinGap() {
    return 1 / 2;
  }

  /**
   * Draws the grid and its elements.
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