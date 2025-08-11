class Segment {
  /**
   * A segment partitioning the container's space.
   * @param {Container} parent The parent container object.
   * @param {Element} element Reference to the DOM element.
   */
  constructor (parent, element, dimensions) {
    this.parent = parent;
    this.element = element;
    this.dimensions = dimensions;
  }

  /**
   * Converts the dimensions into percentages, used for rendering
   * @returns {Object} An object with a percentages for each cardinal direction
   */
  get normalisedPercentages() {
    const rows = this.parent.grid.rows;
    const cols = this.parent.grid.cols;

    return {
      left: this.dimensions.left / cols * 100,
      top: this.dimensions.top / rows * 100,
      width: this.dimensions.width / cols * 100,
      height: this.dimensions.height / rows * 100
    }
  }

  /**
   * Returns the grid coordinate of each edge.
   * @returns {Object} An object with the coordinates of each edge
   */
  get edges() {
    return {
      left: this.dimensions.left,
      top: this.dimensions.top,
      right: this.dimensions.left + this.dimensions.width,
      bottom: this.dimensions.top + this.dimensions.height
    }
  }

  /**
   * @returns {Object} Returns the distance to the nearest horizontal and vertical edges
   */
  get nearestEdge() {
    let nearestEdgeX = {
      distance: Infinity,
      type: null
    };
    let nearestEdgeY = {
      distance: Infinity,
      type: null
    };
    const edges = this.edges;
    const gridMousePos = this.parent.inputHandler.gridMousePos;

    if (Math.abs(edges.left - gridMousePos.x) < nearestEdgeX.distance) {
      nearestEdgeX = {
        distance: Math.abs(edges.left - gridMousePos.x),
        type: "left"
      }
    }
    if (Math.abs(edges.top - gridMousePos.y) < nearestEdgeY.distance) {
      nearestEdgeY = {
        distance: Math.abs(edges.top - gridMousePos.y),
        type: "top"
      }
    }
    if (Math.abs(edges.right - gridMousePos.x) < nearestEdgeX.distance) {
      nearestEdgeX = {
        distance: Math.abs(edges.right - gridMousePos.x),
        type: "right"
      }
    }
    if (Math.abs(edges.bottom - gridMousePos.y) < nearestEdgeY.distance) {
      nearestEdgeY = {
        distance: Math.abs(edges.bottom - gridMousePos.y),
        type: "bottom"
      }
    }
    return { vertical: nearestEdgeX, horizontal: nearestEdgeY };
  }

  // /**
  //  * Calculates the relative bounding box, excluding all pixels outside the container.
  //  * @returns {Object} The relative pixel bounding box.
  //  */
  // getRelativeBoundingBox() {
  //   const containerBoundingBox = this.parent.element.getBoundingClientRect();
  //   const boundingBox = this.element.getBoundingClientRect();
  //   return {
  //     left: boundingBox.left - containerBoundingBox.left,
  //     top: boundingBox.top - containerBoundingBox.top,
  //     width: boundingBox.width,
  //     height: boundingBox.height
  //   }
  // }

  /**
   * Checks wether the cursor is positioned within this segment.
   * @param {number} x The normalised x position of the cursor to the container.
   * @param {number} y The normalised y position of the cursor to the container.
   * @returns {boolean} True if positioned within, false otherwise.
   */
  includesCursorPos(x, y) {
    if (this.dimensions.left < x && this.dimensions.top < y && this.dimensions.left + this.dimensions.width > x && this.dimensions.top + this.dimensions.height > y) {
      return true;
    }
    return false;
  }

  /**
   * Checks wether two segments are adjacent without using the neighbor property.
   * @param {Segment} segment The segment to test against.
   * @returns {boolean} True if segments touch, false otherwise.
   */
  isTouching(segment) {
    const a = this.dimensions;
    const b = segment.dimensions;

    const shareVerticalEdge = a.left + a.width == b.left || a.left == b.left + b.width;
    const verticalOverlap = a.top < b.top + b.height && a.top + a.height > b.top;

    const shareHorizontalEdge = a.top + a.height == b.top || a.top == b.top + b.height;
    const horizontalOverlap = a.left < b.left + b.width && a.left + a.width > b.left;

    return (shareVerticalEdge && verticalOverlap) || (shareHorizontalEdge && horizontalOverlap);
  }

  /**
   * Resize the segment given the css style percentages.
   * @param {Object} normalised An object with a percentage representation of the object's bounding box.
   */
  resize(newDimensions) {
    this.dimensions = {
      ...this.dimensions,
      ...newDimensions
    }

    if (newDimensions.left != null) this.element.style.left = `${this.normalisedPercentages.left}%`;
    if (newDimensions.top != null) this.element.style.top = `${this.normalisedPercentages.top}%`;
    if (newDimensions.width != null) this.element.style.width = `${this.normalisedPercentages.width}%`;
    if (newDimensions.height != null) this.element.style.height = `${this.normalisedPercentages.height}%`;

  }
  
  /**
   * Creates a hard copy of the current segment.
   * @returns {Segment} A reference to the newly made hard-copy of the segment.
   */
  duplicate() {
    const newElement = this.element.cloneNode(false);
    const newSegment = this.parent.addSegment(newElement, this.dimensions);

    return newSegment;
  }
}