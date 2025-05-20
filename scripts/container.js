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
    // const segment = this.focusedSegment;
    // if (!segment) return;

    // const nearestEdge = segment.nearestEdge;
    // if (nearestEdge.distance > this.settings.minPixelGap) return;
    // console.log(nearestEdge);
    
    // // Find current edge and neighboring segment
    // const segment = document.elementFromPoint(mousePos.x, mousePos.y);
    // const segmentDimensions = segment.getBoundingClientRect();
    // const segmentPercentages = {
    //   width: Number(segment.style.width.slice(0, -1)),
    //   height: Number(segment.style.height.slice(0, -1)),
    //   left: Number(segment.style.left.slice(0, -1)),
    //   top: Number(segment.style.top.slice(0, -1)),
    // }

    // if (!segment.classList.contains("segment")) {
    //   console.log("Not a segment");
    //   return;
    // }

    // const nearestEdge = findNearestEdge(segmentDimensions);
    // // const minGapPercentage = minGap / 100 * containerDimensions.height
    // // if (nearestEdge.distance > minGap) {
    // //   console.log("Edge too far")
    // //   return;
    // // }
    // const neighborSegment = findNeighbor(segment, nearestEdge.type);
    // if (!neighborSegment) {
    //   console.log("Not a neighboor")
    //   return;
    // }
    // console.log(segment, neighborSegment);

    // // Handle resizing
  }
}