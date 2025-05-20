class Segment {
  /**
   * A segment partitioning the container's space.
   * @param {Container} parent The parent container object.
   * @param {element} element Reference to the DOM element.
   */
  constructor (parent, element) {
    this.parent = parent;
    this.element = element;
    this.boundingBox = this.getRelativeBoundingBox(parent);
    this.neighbors = {
      left: [],
      top: [],
      right: [],
      bottom: []
    };
  }

  get edges() {
    return {
      left: this.boundingBox.left,
      top: this.boundingBox.top,
      right: this.boundingBox.left + this.boundingBox.width,
      bottom: this.boundingBox.top + this.boundingBox.height
    };
  }

  get percentages() {
    return {
      left: Number(this.element.style.left.slice(0, -1)),
      top: Number(this.element.style.top.slice(0, -1)),
      width: Number(this.element.style.width.slice(0, -1)),
      height: Number(this.element.style.height.slice(0, -1)),
    };
  }

  get nearestEdge() {
    let nearestEdge = {
      distance: Infinity,
      type: null
    };
    const edges = this.edges;
    const relativeMousePos = this.parent.inputHandler.relativeMousePos;

    if (Math.abs(edges.left - relativeMousePos.x) < nearestEdge.distance) {
      nearestEdge = {
        distance: Math.abs(edges.left - relativeMousePos.x),
        type: "left"
      }
    }
    if (Math.abs(edges.top - relativeMousePos.y) < nearestEdge.distance) {
      nearestEdge = {
        distance: Math.abs(edges.top - relativeMousePos.y),
        type: "top"
      }
    }
    if (Math.abs(edges.right - relativeMousePos.x) < nearestEdge.distance) {
      nearestEdge = {
        distance: Math.abs(edges.right - relativeMousePos.x),
        type: "right"
      }
    }
    if (Math.abs(edges.bottom - relativeMousePos.y) < nearestEdge.distance) {
      nearestEdge = {
        distance: Math.abs(edges.bottom - relativeMousePos.y),
        type: "bottom"
      }
    }
    return nearestEdge;
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
      width: boundingBox.width,
      height: boundingBox.height
    }
  }

  /**
   * Resize the segment given the css style percentages.
   * @param {object} percentages An object with a percentage representation of the object's bounding box.
   */
  resize(percentages) {
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
    const newSegment = this.parent.addSegment(newElement);
    newSegment.neighbors.left = [...this.neighbors.left];
    newSegment.neighbors.top = [...this.neighbors.top];
    newSegment.neighbors.right = [...this.neighbors.right];
    newSegment.neighbors.bottom = [...this.neighbors.bottom];
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