import { findBasketHost, type BasketRange } from './basketRanges.ts'

function videoVol(article: number): number {
  return article % 144
}

function videoPart(article: number): number {
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

export function videoPreviewUrl(playlistUrl: string): string {
  return new URL('preview.webp', playlistUrl).href
}
