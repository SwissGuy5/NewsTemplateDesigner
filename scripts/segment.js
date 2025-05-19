class Segment {
  /**
   * A segment partitioning the container's space.
   * @param {element} element Reference to the DOM element.
   */
  constructor (element, parent) {
    this.element = element;
    this.parent = parent;
    this.boundingBox = this.getRelativeBoundingBox(parent);
    this.percentages = {
      left: Number(element.style.left.slice(0, -1)),
      top: Number(element.style.top.slice(0, -1)),
      width: Number(element.style.width.slice(0, -1)),
      height: Number(element.style.height.slice(0, -1)),
    };
    this.neighbors = {
      left: [],
      top: [],
      right: [],
      bottom: []
    };
  }

  /**
   * Calculates the relative bounding box, excluding all pixels outside the container.
   * @returns {object} The relative pixel bounding box.
   */
  getRelativeBoundingBox() {
    const containerBoundingBox = this.parent.element.getBoundingClientRect();
    const boundingBox = this.element.getBoundingClientRect();
    return {
      left: boundingBox.left - containerBoundingBox.left,
      top: boundingBox.top - containerBoundingBox.top,
      width: boundingBox.left + boundingBox.width - containerBoundingBox.left,
      height: boundingBox.top + boundingBox.height - containerBoundingBox.top,
    }
  }

  /**
   * Resize the segment given the css style percentages.
   * @param {object} percentages An object with a percentage representation of the object's bounding box.
   */
  resize(percentages) {
    this.percentages = percentages;
    if (percentages.left) this.element.style.left = `${percentages.left}%`;
    if (percentages.top) this.element.style.top = `${percentages.top}%`;
    if (percentages.width) this.element.style.width = `${percentages.width}%`;
    if (percentages.height) this.element.style.height = `${percentages.height}%`;
    this.boundingBox = this.getRelativeBoundingBox();
  }
  
  /**
   * Creates a hard copy of the current segment.
   * @returns A reference to the newly made hard-copy of the segment.
   */
  duplicate() {
    const newElement = this.element.cloneNode(false);
    const newSegment = new Segment(newElement, this.parent);
    newSegment.neighbors.left = [...this.neighbors.left];
    newSegment.neighbors.top = [...this.neighbors.top];
    newSegment.neighbors.right = [...this.neighbors.right];
    newSegment.neighbors.bottom = [...this.neighbors.bottom];
    newSegment.boundingBox = newElement.getRelativeBoundingBox();
    return newSegment;
  }

  /**
   * Checks wether the cursor is positioned within this segment.
   * @param {number} x The relative x position of the cursor to the container.
   * @param {number} y The relative y position of the cursor to the container.
   * @returns {boolean} True if positioned within, false otherwise.
   */
  includesCursorPos(x, y) {
    if (this.boundingBox.left < x && this.boundingBox.top < y && this.boundingBox.left + this.boundingBox.width > x && this.boundingBox.top + this.boundingBox.height > y) {
      return true;
    }
    return false;
  }
}