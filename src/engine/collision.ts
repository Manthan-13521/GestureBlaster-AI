import type { Vector2 } from "@/types/common";

export function circleCollision(
  a: Vector2,
  aRadius: number,
  b: Vector2,
  bRadius: number,
): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist <= aRadius + bRadius;
}
