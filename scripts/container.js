class Container {
  /**
   * The container representing an A4 page.
   * @param {element} container The DOM container element.
   * @param {Array<Segment>} segments An optional list of existing segments.
   */
  constructor (containerElement, firstSegmentElement, gridElement) {
    this.element = containerElement || document.getElementById("container");
    this.segments = [new Segment(firstSegmentElement, this)];
    this.inputHandler = new InputHandler(this);
    this.grid = new Grid(gridElement);
    this.settings = {
      minPixelGap: 2,
      snapToGrid: true
    }
  }

  get boundingBox() {
    return this.element.getBoundingClientRect();
  }

  get focusedSegment() {
    return this.findSegment(this.inputHandler.relativeMousePos.x, this.inputHandler.relativeMousePos.y);
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

  addSegment(newSegment) {
    // Keep the sorted order on the x axis.
    this.segments.forEach((segment, i) => {
      if (newSegment < segment.boundingBox.x) {
        this.segments.splice(i, 0, newSegment);
      }
    })
  }

  splitSegment(type) {
    const segment = this.focusedSegment;
  }

  removeEdge() {
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