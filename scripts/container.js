class Container {
  /**
   * The container representing an A4 page.
   * @param {element} container The DOM container element.
   * @param {Array<Segment>} segments An optional list of existing segments.
   */
  constructor (containerElement, firstSegmentElement, gridElement) {
    this.element = containerElement || document.getElementById("container");
    this.grid = new Grid(this, gridElement);
    this.segments = [new Segment(this, firstSegmentElement, { top: 0, left: 0, height: this.grid.rows, width: this.grid.cols })];
    this.inputHandler = new InputHandler(this);
  }

  get boundingBox() {
    return this.element.getBoundingClientRect();
  }

  get focusedSegment() {
    return this.findSegment(this.inputHandler.gridMousePos.x, this.inputHandler.gridMousePos.y);
  }

  // TODO: Revisit, remove precision equality, rename vars
  getNeighbors(segment) {
    let neighbors = { left: [], right: [], top: [], bottom: [] };
    const segmentNBB = segment.dimensions;
    this.segments.forEach((segment2, i) => {
      if (segment.isTouching(segment2) && segment != segment2) {
        const segment2NBB = segment2.dimensions;
        
        if (precisionEquality(segmentNBB.left, segment2NBB.left + segment2NBB.width)) neighbors.left.push(segment2);
        if (precisionEquality(segmentNBB.left + segmentNBB.width, segment2NBB.left)) neighbors.right.push(segment2);
        if (precisionEquality(segmentNBB.top, segment2NBB.top + segment2NBB.height)) neighbors.top.push(segment2);
        if (precisionEquality(segmentNBB.top + segmentNBB.height, segment2NBB.top)) neighbors.bottom.push(segment2);
      }
    })
    return neighbors;
  }

  /**
   * Locates a segment given the cursor's position.
   * @param {number} x The normalised x position of the cursor to the container.
   * @param {number} y The normalised y position of the cursor to the container.
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

  addSegment(newElement, dimensions) {
    const newSegment = new Segment(this, newElement, dimensions);
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
    if (nearestEdge.distance < this.grid.gridMinGap) return;
    
    // Get dimensions and snap to grid
    const gridMousePos = this.inputHandler.gridMousePos;
    let relativeGridMousePos = {
      x: Math.round(gridMousePos.x - segment.dimensions.left),
      y: Math.round(gridMousePos.y - segment.dimensions.top)
    };
    
    const s1 = segment.dimensions;    
    const newSegment = segment.duplicate();
    if (type == "vertical") {
      segment.resize({
        width: relativeGridMousePos.x
      })
      newSegment.resize({
        left: s1.left + relativeGridMousePos.x,
        width: s1.width - relativeGridMousePos.x
      })
    } else if (type == "horizontal") {
      segment.resize({
        height: relativeGridMousePos.y
      })
      newSegment.resize({
        top: s1.top + relativeGridMousePos.y,
        height: s1.height - relativeGridMousePos.y
      })
    }
  }

  removeEdge() {
    const segment = this.focusedSegment;
    if (!segment) return;
    
    const nearestEdge = segment.nearestEdge;
    if (nearestEdge.distance > this.grid.gridMinGap) return;

    const neighbors = this.getNeighbors(segment);
    console.log(neighbors);
    
    // Detect which edge to remove and delete if both segments align perfectly (check if single neighbor and is single neighbor of neighbor)
    if (neighbors[nearestEdge.type].length == 1 && this.getNeighbors(neighbors[nearestEdge.type][0])[oppositeDirection[nearestEdge.type]].length == 1) {
      const neighborSegment = neighbors[nearestEdge.type][0];
      console.log(neighborSegment)
      const neighborPercentages = neighborSegment.dimensions;
      const segmentPercentages = segment.dimensions;
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