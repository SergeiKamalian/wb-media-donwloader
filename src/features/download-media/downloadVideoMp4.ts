import { fetchVideoSegmentBytes } from '../../entities/product/fetchVideoMedia.ts'
import { mapWithConcurrency } from '../../shared/lib/mapWithConcurrency.ts'
import { muxTsToMp4 } from './muxTsToMp4.ts'

export const videoSegmentLimit = 6

export async function downloadVideoSegments(
  segmentUrls: readonly string[],
  signal: AbortSignal,
  onSegmentProgress: (completed: number, total: number) => void,
): Promise<Uint8Array[]> {
  let completed = 0

  return mapWithConcurrency(segmentUrls, videoSegmentLimit, async (url) => {
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    try {
      return await fetchVideoSegmentBytes(url, signal)
    } finally {
      completed += 1
      onSegmentProgress(completed, segmentUrls.length)
    }
  })
}

export async function assembleVideoMp4(
  segments: readonly Uint8Array[],
): Promise<Uint8Array> {
  return muxTsToMp4(segments)
}
