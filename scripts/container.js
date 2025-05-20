class Container {
  /**
   * The container representing an A4 page.
   * @param {element} container The DOM container element.
   * @param {Array<Segment>} segments An optional list of existing segments.
   */
  constructor (containerElement, firstSegmentElement, gridElement) {
    this.element = containerElement || document.getElementById("container");
    this.segments = [new Segment(this, firstSegmentElement)];
    this.inputHandler = new InputHandler(this);
    this.grid = new Grid(this, gridElement);
    this.settings = {
      snap: true
    }
  }

  get boundingBox() {
    return this.element.getBoundingClientRect();
  }

  get focusedSegment() {
    return this.findSegment(this.inputHandler.relativeMousePos.x, this.inputHandler.relativeMousePos.y);
  }

  get minGap() {
    return this.grid.minGap;
  }

  // Relative x and y pixel displacement
  /**
   * Locates a segment given the cursor's position.
   * @param {number} x The relative x position of the cursor to the container.
   * @param {number} y The relative y position of the cursor to the container.
   * @returns {Segment} Returns the segment, or null if outside any segments.
   */
  findSegment(x, y) {
    let foundSegment = null;
    this.segments.forEach((segment, i) => {
      if (segment.includesCursorPos(x, y)) {
        foundSegment = segment;
        return null;
      }
    })
    return foundSegment;
  }

  addSegment(newElement) {
    const newSegment = new Segment(this, newElement);
    this.element.appendChild(newElement);
    this.segments.push(newSegment);

    // // Keep the sorted order on the x axis.
    // this.segments.forEach((segment, i) => {
    //   if (newSegment < segment.boundingBox.x) {
    //     this.segments.splice(i, 0, newSegment);
    //   }
    // })
    return newSegment;
  }

  /**
   * Splits a segment into two seperate ones at the cursors position.
   * @param {String} type Vertical or Horizontal
   */
  splitSegment(type) {
    const segment = this.focusedSegment;
    if (!segment) return;

    // If new edge is too close to existing edge
    const nearestEdge = segment.nearestEdge;
    if (nearestEdge.distance < this.minGap) return;
    
    // Get dimensions and snap to grid
    const relativeMousePos = this.inputHandler.relativeMousePos;
    let newDimensions = {
      x: relativeMousePos.x - segment.boundingBox.left,
      y: relativeMousePos.y - segment.boundingBox.top
    };
    if (this.settings.snap) newDimensions = this.grid.snapToGrid(newDimensions);
    
    const segmentPercentages = segment.percentages;
    const newPercentages = {
      width: newDimensions.x / segment.boundingBox.width * segmentPercentages.width,
      height: newDimensions.y / segment.boundingBox.height * segmentPercentages.height
    }
    const newSegment = segment.duplicate();
    if (type == "vertical") {
      segment.neighbors.right.push(newSegment);
      newSegment.neighbors.left.push(segment);
      segment.resize({
        width: newPercentages.width
      })
      newSegment.resize({
        left: segmentPercentages.left + newPercentages.width,
        width: segmentPercentages.width - newPercentages.width
      })
    } else if (type == "horizontal") {
      segment.neighbors.bottom.push(newSegment);
      newSegment.neighbors.top.push(segment);
      segment.resize({
        height: newPercentages.height
      })
      newSegment.resize({
        top: segmentPercentages.top + newPercentages.height,
        height: segmentPercentages.height - newPercentages.height
      })
    }
    segment.updateNeighbors();
    newSegment.updateNeighbors();
  }

  removeEdge() {
    const segment = this.focusedSegment;
    if (!segment) return;

    const nearestEdge = segment.nearestEdge;
    if (nearestEdge.distance > this.minGap) return;
    console.log(nearestEdge);

    if (nearestEdge.type == "left" || nearestEdge.type == "right") {
      segment.neighbors[nearestEdge.type].forEach(segment => {
        console.log(segment);
      })
    }
  }
}