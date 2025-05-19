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