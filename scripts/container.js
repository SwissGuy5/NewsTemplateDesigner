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

  getNeighbors(segment) {
    let neighbors = { left: [], right: [], top: [], bottom: [] };
    const segmentPercentages = segment.percentages;
    console.log(segmentPercentages)
    this.segments.forEach((segment2, i) => {
      if (segment.isTouching(segment2) && segment != segment2) {
        const segment2Percentages = segment2.percentages;

        // if (precisionEquality(segment.boundingBox.left, segment2.boundingBox.left + segment2.boundingBox.width)) neighbors.left.push(segment2);
        // if (precisionEquality(segment.boundingBox.left + segment.boundingBox.width, segment2.boundingBox.left)) neighbors.right.push(segment2);
        // if (precisionEquality(segment.boundingBox.top, segment2.boundingBox.top + segment2.boundingBox.height)) neighbors.top.push(segment2);
        // if (precisionEquality(segment.boundingBox.top + segment.boundingBox.height, segment2.boundingBox.top)) neighbors.bottom.push(segment2);

        if (precisionEquality(segmentPercentages.left, segment2Percentages.left + segment2Percentages.width)) neighbors.left.push(segment2);
        if (precisionEquality(segmentPercentages.left + segmentPercentages.width, segment2Percentages.left)) neighbors.right.push(segment2);
        if (precisionEquality(segmentPercentages.top, segment2Percentages.top + segment2Percentages.height)) neighbors.top.push(segment2);
        if (precisionEquality(segmentPercentages.top + segmentPercentages.height, segment2Percentages.top)) neighbors.bottom.push(segment2);
      }
    })
    return neighbors;
  }

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
    return newSegment;
  }

  removeSegment(segment) {
    this.segments = this.segments.filter(s => s != segment);
    segment.element.remove();
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
      segment.resize({
        width: newPercentages.width
      })
      newSegment.resize({
        left: segmentPercentages.left + newPercentages.width,
        width: segmentPercentages.width - newPercentages.width
      })
    } else if (type == "horizontal") {
      segment.resize({
        height: newPercentages.height
      })
      newSegment.resize({
        top: segmentPercentages.top + newPercentages.height,
        height: segmentPercentages.height - newPercentages.height
      })
    }
  }

  removeEdge() {
    const segment = this.focusedSegment;
    if (!segment) return;
    
    const nearestEdge = segment.nearestEdge;
    if (nearestEdge.distance > this.minGap) return;
    console.log(nearestEdge)

    const neighbors = this.getNeighbors(segment);
    console.log(neighbors);
    
    // Detect which edge to remove and delete if both segments align perfectly (check if single neighbor and is single neighbor of neighbor)
    if (neighbors[nearestEdge.type].length == 1 && this.getNeighbors(neighbors[nearestEdge.type][0])[oppositeDirection[nearestEdge.type]].length == 1) {
      const neighborSegment = neighbors[nearestEdge.type][0];
      const neighborPercentages = neighborSegment.percentages;
      const segmentPercentages = segment.percentages;
      const newPercentages = {
        left: Math.min(neighborPercentages.left, segmentPercentages.left),
        top: Math.min(neighborPercentages.top, segmentPercentages.top),
        width: (nearestEdge.type == "left" || nearestEdge.type == "right") ? neighborPercentages.width + segmentPercentages.width : segmentPercentages.width,
        height: (nearestEdge.type == "top" || nearestEdge.type == "bottom") ? neighborPercentages.height + segmentPercentages.height : segmentPercentages.height
      }
      neighborSegment.resize(newPercentages);
      this.removeSegment(segment);
    }
  }
}