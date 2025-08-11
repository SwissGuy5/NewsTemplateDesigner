class Container {
  /**
   * The container representing an A4 page.
   * @param {Container} container The DOM container element.
   * @param {Array<Segment>} segments An optional list of existing segments.
   * @param {Element} gridElement The DOM grid element.
   */
  constructor (containerElement, firstSegmentElement, gridElement) {
    this.element = containerElement || document.getElementById("container");
    this.grid = new Grid(this, gridElement);
    this.segments = [new Segment(this, firstSegmentElement, { top: 0, left: 0, height: this.grid.rows, width: this.grid.cols })];
    this.inputHandler = new InputHandler(this);
  }

  /**
   * @returns {Object} Returns the container's boundingClientRect
   */
  get boundingBox() {
    return this.element.getBoundingClientRect();
  }

  /**
   * @returns {Object} Returns the segment currently hovered over by the cursor
   */
  get focusedSegment() {
    return this.findSegment(this.inputHandler.gridMousePos.x, this.inputHandler.gridMousePos.y);
  }

  /**
   * Returns all segments that touch one of the main segments sides.
   * @param {Segment} segment The main segment for which we find neighbors.
   * @returns {Object<Array>} An object with neighbor arrays for each cardinal direction.
   */
  getNeighbors(segment) {
    let neighbors = { left: [], right: [], top: [], bottom: [] };
    const s1 = segment.dimensions;
    this.segments.forEach((segment2, i) => {
      if (segment.isTouching(segment2) && segment != segment2) {
        const s2 = segment2.dimensions;
        
        if (s1.left == s2.left + s2.width) neighbors.left.push(segment2);
        if (s1.left + s1.width == s2.left) neighbors.right.push(segment2);
        if (s1.top == s2.top + s2.height) neighbors.top.push(segment2);
        if (s1.top + s1.height == s2.top) neighbors.bottom.push(segment2);
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

  /**
   * Creates a new segment given dimensions and adds it to the segments array.
   * @param {Element} newElement The DOM display element
   * @param {Object} dimensions The grid dimensions of the new segment
   * @returns {Segment} The new segment
   */
  addSegment(newElement, dimensions) {
    const newSegment = new Segment(this, newElement, dimensions);
    this.element.appendChild(newElement);
    this.segments.push(newSegment);
    return newSegment;
  }

  /**
   * Removes the given segment from the segments array and deletes its DOM element.
   * @param {Segment} segment The segment to remove
   */
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
    const nearestEdge = segment.nearestEdge[type];
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

  /**
   * Removes an edge based on the current mouse position.
   */
  removeEdge() {
    const segment = this.focusedSegment;
    if (!segment) return;
    
    const nearestEdges = segment.nearestEdge;
    let nearestEdge = nearestEdges.horizontal;
    if (nearestEdge.distance > nearestEdges.vertical.distance) nearestEdge = nearestEdges.vertical;
    if (nearestEdge.distance > this.grid.gridMinGap) return;

    const neighbors = this.getNeighbors(segment);
    
    // Detect which edge to remove and delete if both segments align perfectly (check if single neighbor and is single neighbor of neighbor)
    if (neighbors[nearestEdge.type].length == 1 && this.getNeighbors(neighbors[nearestEdge.type][0])[oppositeDirection[nearestEdge.type]].length == 1) {
      const neighborSegment = neighbors[nearestEdge.type][0];
      const neighborDimensions = neighborSegment.dimensions;
      const segmentDimensions = segment.dimensions;
      const newPercentages = {
        left: Math.min(neighborDimensions.left, segmentDimensions.left),
        top: Math.min(neighborDimensions.top, segmentDimensions.top),
        width: (nearestEdge.type == "left" || nearestEdge.type == "right") ? neighborDimensions.width + segmentDimensions.width : segmentDimensions.width,
        height: (nearestEdge.type == "top" || nearestEdge.type == "bottom") ? neighborDimensions.height + segmentDimensions.height : segmentDimensions.height
      }
      neighborSegment.resize(newPercentages);
      this.removeSegment(segment);
    }
  }
}