class Grid {
  constructor (element) {
    this.element = element;
    this.gridMultiplier = 2;
    this.rows = 22 * this.gridMultiplier;
    this.cols = 16 * this.gridMultiplier;
    
    this.updateGridTemplate();
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

