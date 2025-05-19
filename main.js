// --- Classes ---
class Container {
  /**
   * The container representing an A4 page.
   * @param {element} container The DOM container element.
   * @param {Array<Segment>} segments An optional list of existing segments.
   */
  constructor (container, segments) {
    this.container = container || document.getElementById("container");
    this.containerBoundingBox = this.container.getBoundingClientRect();
    this.segments = [segments];
  }

  // Relative x and y pixel displacement
  /**
   * Locates a segment given the cursor's position.
   * @param {number} x The relative x position of the cursor to the container.
   * @param {*} y The relative y position of the cursor to the container.
   * @returns {Segment} Returns the segment, or null if outside any segments.
   */
  findSegment(x, y) {
    let foundSegment = null;
    this.segments.forEach((segment, i) => {
      if (segment.cursorWithin()) {
        foundSegment = segment;
        return null;
      }
    })
    return foundSegment;
  }

  addSegment(newSegment) {
    // Keep the sorted order on the x axis.
    this.segments.forEach((segment, i) => {
      if (newSegment < segment.dimensions.x) {
        this.segments.splice(i, 0, newSegment);
      }
    })
  }

  splitSegment(segment, ) {
    
  }

  removeEdge() {

  }
}

class Segment {
  /**
   * A segment partitioning the container's space.
   * @param {element} element Reference to the DOM element.
   */
  constructor (element) {
    this.element = element;
    this.dimensions = this.getRelativeBoundingBox();
    this.percentages = {
      left: Number(element.style.left.slice(0, -1)),
      top: Number(element.style.top.slice(0, -1)),
      width: Number(element.style.width.slice(0, -1)),
      height: Number(element.style.height.slice(0, -1)),
    };
    this.neighbors = {
      left: [],
      top: [],
      right: [],
      bottom: []
    };
  }

  /**
   * Calculates the relative bounding box, excluding all pixels outside the container.
   * @param {object} parent The parent / container element bounding box.
   * @returns {object} The relative pixel dimensions.
   */
  getRelativeBoundingBox(parent) {
    const boundingBox = this.element.getBoundingClientRect();
    return {
      left: boundingBox.left - parent.left,
      top: boundingBox.top - parent.top,
      width: boundingBox.left + boundingBox.width - parent.left,
      height: boundingBox.top + boundingBox.height - parent.top,
    }
  }

  /**
   * Resize the segment given the css style percentages.
   * @param {object} percentages An object with a percentage representation of the object's dimensions.
   */
  resize(percentages) {
    this.percentages = percentages;
    if (percentages.left) this.element.style.left = `${percentages.left}%`;
    if (percentages.top) this.element.style.top = `${percentages.top}%`;
    if (percentages.width) this.element.style.width = `${percentages.width}%`;
    if (percentages.height) this.element.style.height = `${percentages.height}%`;
    this.dimensions = this.getRelativeBoundingBox();
  }
  
  /**
   * Creates a hard copy of the current segment.
   * @returns The new, hard copied segment.
   */
  duplicate() {
    const newElement = this.element.cloneNode(false);
    const newSegment = new Segment(newElement);
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
  cursorWithin(x, y) {
    if (this.dimensions.left < x && this.dimensions.top < y && this.dimensions.left + this.dimensions.width > x && this.dimensions.top + this.dimensions.height > y) {
      return true;
    }
    return false;
  }
}


// --- Init Variables ---
const container = document.getElementById("container");
const containerDimensions = container.getBoundingClientRect();
const minGap = 2;
let snapToGrid = true;
let mousePos = {
  x: 0,
  y: 0
};


// --- Functions ---
function addSegment(orientation, snap=false) {
  const segment = document.elementFromPoint(mousePos.x, mousePos.y);
  const segmentDimensions = segment.getBoundingClientRect();
  const segmentPercentages = {
    width: Number(segment.style.width.slice(0, -1)),
    height: Number(segment.style.height.slice(0, -1)),
    left: Number(segment.style.left.slice(0, -1)),
    top: Number(segment.style.top.slice(0, -1)),
  }

  if (!segment.classList.contains("segment")) {
    console.log("Not a segment");
    return;
  }

  // console.log(segmentDimensions);
  // console.log(segment.style, segmentData)

  if (orientation == "vertical") {
    let lineX = mousePos.x - segmentDimensions.left;

    // Handle grid snap
    if (snap) {
      const line = mousePos.x - segmentDimensions.left;
      const gridSize = containerDimensions.width / cols;
      const gridLine = Math.round(line / (gridSize));
      lineX = gridLine * gridSize;
    }

    // Calculate new width
    const newWidth = lineX / (segmentDimensions.width) * (segmentPercentages.width);

    // Ensure some distance between each line
    if (newWidth > segmentPercentages.width - minGap || newWidth < minGap) {
      console.log("Gap too small");
      return;
    }
    
    // Set new widths and lefts
    const newSegment = segment.cloneNode(false);
    segment.style.width = `${newWidth}%`;
    newSegment.style.width = `${segmentPercentages.width - newWidth}%`;
    newSegment.style.left = `${segmentPercentages.left + newWidth}%`;

    // Append new segment
    container.appendChild(newSegment);
  } else if (orientation == "horizontal") {
    let lineY = mousePos.y - segmentDimensions.top;

    // Handle grid snap
    if (snap) {
      const line = mousePos.y - segmentDimensions.top;
      const gridSize = containerDimensions.height / rows;
      const gridLine = Math.round(line / (gridSize));
      lineY = gridLine * gridSize;
    }
    
    // Calculate new height
    const newHeight = lineY / (segmentDimensions.height) * (segmentPercentages.height);
    
    // Ensure some distance between each line
    if (newHeight > segmentPercentages.height - minGap || newHeight < minGap) {
      console.log("Gap too small");
      return;
    }
    
    // Set new heights and tops
    const newSegment = segment.cloneNode(false);
    segment.style.height = `${newHeight}%`;
    newSegment.style.height = `${segmentPercentages.height - newHeight}%`;
    newSegment.style.top = `${segmentPercentages.top + newHeight}%`;

    // Append new segment
    container.appendChild(newSegment);
  }
}
function findNearestEdge(segmentDimensions) {
  let nearestEdge = {
    distance: Infinity,
    type: null
  };
  const relativeMousePos = {
    x: mousePos.x - containerDimensions.left,
    y: mousePos.y - containerDimensions.top
  }
  const edges = {
    left: segmentDimensions.left - containerDimensions.left,
    top: segmentDimensions.top - containerDimensions.top,
    right: segmentDimensions.left - containerDimensions.left + segmentDimensions.width,
    bottom: segmentDimensions.top - containerDimensions.top + segmentDimensions.height
  };
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
function findNeighbor(segment, nearestEdge) {
  const distanceToNextSegment = minGap * 4;
  let neighborSegment;
  switch (nearestEdge) {
    case "left":
      neighborSegment = document.elementFromPoint(mousePos.x - distanceToNextSegment, mousePos.y);
      break;
    case "top":
      neighborSegment = document.elementFromPoint(mousePos.x, mousePos.y - distanceToNextSegment);
      break;
    case "right":
      neighborSegment = document.elementFromPoint(mousePos.x + distanceToNextSegment, mousePos.y);
      break;
    case "bottom":
      neighborSegment = document.elementFromPoint(mousePos.x, mousePos.y + distanceToNextSegment);
      break;
  }

  if (!neighborSegment || segment == neighborSegment || !neighborSegment.classList.contains("segment")) {
    return null;
  }
  return neighborSegment;
}

// --- Event Listeners ---
container.addEventListener("mousemove", e => {
  mousePos = {
    x: e.clientX,
    y: e.clientY
  }
});
container.addEventListener("mousedown", e => {
  if (e.button != 2) {
    return;
  }

  // Find current edge and neighboring segment
  const segment = document.elementFromPoint(mousePos.x, mousePos.y);
  const segmentDimensions = segment.getBoundingClientRect();
  const segmentPercentages = {
    width: Number(segment.style.width.slice(0, -1)),
    height: Number(segment.style.height.slice(0, -1)),
    left: Number(segment.style.left.slice(0, -1)),
    top: Number(segment.style.top.slice(0, -1)),
  }

  if (!segment.classList.contains("segment")) {
    console.log("Not a segment");
    return;
  }

  const nearestEdge = findNearestEdge(segmentDimensions);
  // const minGapPercentage = minGap / 100 * containerDimensions.height
  // if (nearestEdge.distance > minGap) {
  //   console.log("Edge too far")
  //   return;
  // }
  const neighborSegment = findNeighbor(segment, nearestEdge.type);
  if (!neighborSegment) {
    console.log("Not a neighboor")
    return;
  }
  console.log(segment, neighborSegment);

  // Handle resizing

})
container.addEventListener('contextmenu', e => {
  e.preventDefault();
});
document.addEventListener("keydown", e => {
  switch (e.key) {
    case "1":
      addSegment("vertical", snapToGrid);
      break;
    case "2":
      addSegment("horizontal", snapToGrid);
      break;
  }
});


// --- Grid ---
let gridMultiplier = 2;
let rows = 22 * gridMultiplier;
let cols = 16 * gridMultiplier;
const gridOverlay = document.getElementById('grid-overlay');
gridOverlay.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
gridOverlay.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

for (let i = 0; i < rows * cols; i++) {
  gridOverlay.appendChild(document.createElement('div'));
}