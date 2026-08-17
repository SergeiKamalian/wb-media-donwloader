import { findBasketHost, type BasketRange } from './basketRanges.ts'

export function articleVol(article: number): number {
  return Math.floor(article / 100_000)
}

export function articleSpec(article: number): number {
  return Math.floor(article / 1_000)
}

export function buildPhotoUrl(
  article: number,
  photoNumber: number,
  ranges: readonly BasketRange[],
): string {
  const vol = articleVol(article)
  const spec = articleSpec(article)
  const host = findBasketHost(vol, ranges)
  return `https://${host}/vol${vol}/part${spec}/${article}/images/big/${photoNumber}.webp`
}
