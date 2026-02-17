import { keccak256, encodePacked } from "viem";

export function computeReviewHash(
  entityId: string,
  rating: number,
  text: string
): string {
  return keccak256(
    encodePacked(["string", "uint8", "string"], [entityId, rating, text])
  );
}
