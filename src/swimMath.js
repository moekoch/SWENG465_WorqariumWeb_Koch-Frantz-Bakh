// swim speed in "stage widths per second" so it feels the same at any screen size
const SWIM_SPEED = 0.3
const MIN_SWIM_SECONDS = 0.5
const MAX_SWIM_SECONDS = 3.2

// map backgrounds are 1376 x 768, used to make vertical distance count correctly
export const STAGE_ASPECT = 768 / 1376

// how long a swim from one spot to another takes (positions are fractions 0 to 1)
export function swimSeconds(fromX, fromY, toX, toY) {
  const distance = Math.hypot(toX - fromX, (toY - fromY) * STAGE_ASPECT)
  return Math.min(MAX_SWIM_SECONDS, Math.max(MIN_SWIM_SECONDS, distance / SWIM_SPEED))
}
