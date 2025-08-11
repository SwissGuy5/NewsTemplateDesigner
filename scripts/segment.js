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

  isTouchingPercentages(segment2) {
    const segmentPercentages = this.percentages;
    const segment2Percentages = segment2.percentages;

    const shareVerticalEdge = segmentPercentages.left == segment2Percentages.left + segment2Percentages.width || segmentPercentages.left + segmentPercentages.width == segment2Percentages.left;
    const withinTopEdge = segmentPercentages.top >= segment2Percentages.top && segmentPercentages.top < segment2Percentages.top + segment2Percentages.height;
    const withinYMiddleEdge = segmentPercentages.top < segment2Percentages.top && segmentPercentages.top + segmentPercentages.height > segment2Percentages.top + segment2Percentages.height;
    const withinBottomEdge = segmentPercentages.top + segmentPercentages.height > segment2Percentages.top && segmentPercentages.top + segmentPercentages.height <= segment2Percentages.top + segment2Percentages.height;
    // console.log(segment2, shareVerticalEdge, withinTopEdge, withinYMiddleEdge, withinBottomEdge)
    
    const shareHorizontalEdge = segmentPercentages.top == segment2Percentages.top + segment2Percentages.height || segmentPercentages.top + segmentPercentages.height == segment2Percentages.top;
    const withinLeftEdge = segmentPercentages.left >= segment2Percentages.left && segmentPercentages.left < segment2Percentages.left + segment2Percentages.width;
    const withinXMiddleEdge = segmentPercentages.left < segment2Percentages.left && segmentPercentages.left + segmentPercentages.width > segment2Percentages.left + segment2Percentages.width;
    const withinRightEdge = segmentPercentages.left + segmentPercentages.width > segment2Percentages.left && segmentPercentages.left + segmentPercentages.width <= segment2Percentages.left + segment2Percentages.width;
    
    return (shareVerticalEdge && (withinTopEdge || withinYMiddleEdge || withinBottomEdge)) || (shareHorizontalEdge && (withinLeftEdge || withinXMiddleEdge || withinRightEdge));
  }

  /**
   * Checks wether two segments are adjacent without using the neighbor property.
   * @param {Segment} segment The segment to test against.
   * @returns {boolean} True if segments touch, false otherwise.
   * ! This function is not always precise. False positives occur.
   */
  isTouching(segment) {
    const a = this.boundingBox;
    const b = segment.boundingBox;

    const shareVerticalEdge = precisionEquality(a.left + a.width, b.left) || precisionEquality(a.left, b.left + b.width);
    const verticalOverlap = round(a.top) < round(b.top + b.height) && round(a.top + a.height) > round(b.top);

    const shareHorizontalEdge = precisionEquality(a.top + a.height, b.top) || precisionEquality(a.top, b.top + b.height);
    const horizontalOverlap = round(a.left) < round(b.left + b.width) && round(a.left + a.width) > round(b.left);

    console.log( segment, 
      round(a.left) < round(b.left + b.width) &&
      round(a.left + a.width) > round(b.left) &&
      round(a.top) < round(b.top + b.height) &&
      round(a.top + a.height) > round(b.top)
    );

    return (shareVerticalEdge && verticalOverlap) || (shareHorizontalEdge && horizontalOverlap);

    // const shareVerticalEdge = precisionEquality(this.boundingBox.left, segment.boundingBox.left + segment.boundingBox.width) || precisionEquality(this.boundingBox.left + this.boundingBox.width, segment.boundingBox.left);
    // const withinTopEdge = this.boundingBox.top >= segment.boundingBox.top && this.boundingBox.top < segment.boundingBox.top + segment.boundingBox.height;
    // const withinYMiddleEdge = this.boundingBox.top < segment.boundingBox.top && this.boundingBox.top + this.boundingBox.height > segment.boundingBox.top + segment.boundingBox.height;
    // const withinBottomEdge = this.boundingBox.top + this.boundingBox.height > segment.boundingBox.top && this.boundingBox.top + this.boundingBox.height <= segment.boundingBox.top + segment.boundingBox.height;
    // const shareHorizontalEdge = precisionEquality(this.boundingBox.top, segment.boundingBox.top + segment.boundingBox.height) || precisionEquality(this.boundingBox.top + this.boundingBox.height, segment.boundingBox.top);
    // const withinLeftEdge = this.boundingBox.left >= segment.boundingBox.left && this.boundingBox.left < segment.boundingBox.left + segment.boundingBox.width;
    // const withinXMiddleEdge = this.boundingBox.left < segment.boundingBox.left && this.boundingBox.left + this.boundingBox.width > segment.boundingBox.left + segment.boundingBox.width;
    // const withinRightEdge = this.boundingBox.left + this.boundingBox.width > segment.boundingBox.left && this.boundingBox.left + this.boundingBox.width <= segment.boundingBox.left + segment.boundingBox.width;
    // return (shareVerticalEdge && (withinTopEdge || withinYMiddleEdge || withinBottomEdge)) || (shareHorizontalEdge && (withinLeftEdge || withinXMiddleEdge || withinRightEdge));
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

    return newSegment;
  }
}