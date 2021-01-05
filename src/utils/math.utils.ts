const isIntersect = (
  rect: { x: number; y: number; width: number; height: number },
  position: { x: number; y: number }
) =>
  !(
    position.x < rect.x ||
    position.y < rect.y ||
    position.x > rect.x + rect.width ||
    position.y > rect.y + rect.height
  );

const distance = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const MathUtils = {
  isIntersect,
  distance,
};
