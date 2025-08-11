function precisionEquality(n1, n2, epsilon=0.001) {
  return Math.abs(n1 - n2) < epsilon;
}

const round = x => Math.round(x * 100) / 100;

const oppositeDirection = {
  left: "right",
  top: "bottom",
  right: "left",
  bottom: "top"
}