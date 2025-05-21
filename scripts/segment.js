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

  // Todo: Fix issue with corners and segment that doesn't reach any sides, fix within detection
  /**
   * Checks wether two segments are adjacent without using the neighbor property.
   * @param {Segment} segment The segment to test against.
   * @returns {boolean} True if segments touch, false otherwise.
   */
  isTouching(segment) {
    const shareVerticalEdge = precisionEquality(this.boundingBox.left, segment.boundingBox.left + segment.boundingBox.width) || precisionEquality(this.boundingBox.left + this.boundingBox.width, segment.boundingBox.left);
    const withinTopEdge = this.boundingBox.top >= segment.boundingBox.top && this.boundingBox.top < segment.boundingBox.top + segment.boundingBox.height;
    const withinYMiddleEdge = this.boundingBox.top < segment.boundingBox.top && this.boundingBox.top + this.boundingBox.height > segment.boundingBox.top + segment.boundingBox.height;
    const withinBottomEdge = this.boundingBox.top + this.boundingBox.height > segment.boundingBox.top && this.boundingBox.top + this.boundingBox.height <= segment.boundingBox.top + segment.boundingBox.height;
    const shareHorizontalEdge = precisionEquality(this.boundingBox.top, segment.boundingBox.top + segment.boundingBox.height) || precisionEquality(this.boundingBox.top + this.boundingBox.height, segment.boundingBox.top);
    const withinLeftEdge = this.boundingBox.left >= segment.boundingBox.left && this.boundingBox.left < segment.boundingBox.left + segment.boundingBox.width;
    const withinXMiddleEdge = this.boundingBox.left < segment.boundingBox.left && this.boundingBox.left + this.boundingBox.width > segment.boundingBox.left + segment.boundingBox.width;
    const withinRightEdge = this.boundingBox.left + this.boundingBox.width > segment.boundingBox.left && this.boundingBox.left + this.boundingBox.width <= segment.boundingBox.left + segment.boundingBox.width;
    return (shareVerticalEdge && (withinTopEdge || withinYMiddleEdge || withinBottomEdge)) || (shareHorizontalEdge && (withinLeftEdge || withinXMiddleEdge || withinRightEdge));
  }

  /**
   * Adds on the neighbors of another segment.
   * @param {object} neighbors The neighbor object of another segment.
   */
  addNeighbors(neighbors) {
    for (let direction in this.neighbors) {
      neighbors[direction].forEach(neighbor => {
        if (this.neighbors[direction].every(segment => segment != neighbor)) this.neighbors[direction].push(neighbor);
      })
    }
  }

  /**
   * Removes any neighboring segment no longer touching this segment.
   */
  updateNeighbors() {
    for (let direction in this.neighbors) {
      this.neighbors[direction] = this.neighbors[direction].filter(segment => {
        if (!this.isTouching(segment)) {
          segment.neighbors[oppositeDirection[direction]] = segment.neighbors[oppositeDirection[direction]].filter(s => s != this);
          return false;
        }
        return true;
      });
    }
  }

  /**
   * Called when deleting a segment, removes itself as a neighbor of all its neighbors
   */
  removeFromNeighbors() {
    for (let direction in this.neighbors) {
      this.neighbors[direction].forEach(segment => {
        segment.neighbors[oppositeDirection[direction]] = segment.neighbors[oppositeDirection[direction]].filter(s => s != this);
      });
    }
  }

  /**
   * Resize the segment given the css style percentages.
   * @param {object} percentages An object with a percentage representation of the object's bounding box.
   */
  resize(percentages) {
    if (percentages.left != null) this.element.style.left = `${percentages.left}%`;
    if (percentages.top != null) this.element.style.top = `${percentages.top}%`;
    if (percentages.width != null) this.element.style.width = `${percentages.width}%`;
    if (percentages.height != null) this.element.style.height = `${percentages.height}%`;
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

    // Add new segment to neighboring segment's neighbors
    for (let direction in newSegment.neighbors) {
      newSegment.neighbors[direction].forEach(segment => {
        segment.neighbors[oppositeDirection[direction]].push(newSegment);
      });
    }

    return newSegment;
  }
}