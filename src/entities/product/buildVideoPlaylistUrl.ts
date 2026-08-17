import { findBasketHost, type BasketRange } from './basketRanges.ts'

export function videoVol(article: number): number {
  return article % 144
}

export function videoPart(article: number): number {
  return Math.floor(article / 10_000)
}

export function buildVideoPlaylistUrl(
  article: number,
  ranges: readonly BasketRange[],
): string {
  const vol = videoVol(article)
  const part = videoPart(article)
  const host = findBasketHost(vol, ranges)
  return `https://${host}/vol${vol}/part${part}/${article}/hls/1440p/index.m3u8`
}
