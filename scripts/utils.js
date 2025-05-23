function precisionEquality(n1, n2, epsilon=0.1) {
    return Math.abs(n1 - n2) < epsilon;
}

const oppositeDirection = {
  left: "right",
  top: "bottom",
  right: "left",
  bottom: "top"
}