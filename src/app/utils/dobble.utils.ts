export type Card = string[];

export const MM_TO_PX = 3.7795;

export function requiredImagesForMode(mode: 4 | 6 | 8): number {
  return mode === 4 ? 13 : mode === 6 ? 31 : 57;
}
