import { Zip, ZipPassThrough } from 'fflate'
import { mapWithConcurrency } from '../../shared/lib/mapWithConcurrency.ts'
import {
  detectImageExtension,
  type ImageTypeMismatch,
} from './detectImageExtension.ts'

export const photoDownloadLimit = 6

export enum PhotosZipBuildState {
  Empty = 'empty',
  Ready = 'ready',
}

export type PhotoDownloadItem = {
  number: number
  url: string
}

export type PhotosZipResult =
  | { state: PhotosZipBuildState.Empty; mismatches: ImageTypeMismatch[] }
  | {
      state: PhotosZipBuildState.Ready
      added: number
      zipBytes: Uint8Array
      mismatches: ImageTypeMismatch[]
    }

function concatChunks(chunks: readonly Uint8Array[]): Uint8Array {
  let total = 0
  for (const chunk of chunks) {
    total += chunk.byteLength
  }

  const output = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.byteLength
  }
  return output
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function paddedPhotoNumber(photoNumber: number): string {
  return String(photoNumber).padStart(2, '0')
}

export async function downloadPhotosZip(
  article: number,
  photos: readonly PhotoDownloadItem[],
  signal: AbortSignal,
  onProgress: (completed: number, total: number) => void,
): Promise<PhotosZipResult> {
  const chunks: Uint8Array[] = []
  let added = 0
  let completed = 0
  const mismatches: ImageTypeMismatch[] = []
  let writeQueue: Promise<void> = Promise.resolve()

  const zip = new Zip()
  const zipDone = new Promise<Uint8Array>((resolve, reject) => {
    zip.ondata = (error, data, final) => {
      if (error !== null) {
        reject(error)
        return
      }

      chunks.push(data)
      if (final) {
        resolve(concatChunks(chunks))
      }
    }
  })

  function enqueueWrite(task: () => void): Promise<void> {
    const next = writeQueue.then(task)
    writeQueue = next.catch(() => undefined)
    return next
  }

  try {
    await mapWithConcurrency(photos, photoDownloadLimit, async (photo) => {
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }

      try {
        const response = await fetch(photo.url, { signal })
        if (!response.ok) {
          return
        }

        const buffer = await response.arrayBuffer()
        const bytes = new Uint8Array(buffer)
        const detected = detectImageExtension(
          bytes,
          response.headers.get('content-type'),
          photo.number,
        )

        if (detected.mismatch !== null) {
          mismatches.push(detected.mismatch)
        }

        await enqueueWrite(() => {
          const filename = `${article}-${paddedPhotoNumber(photo.number)}.${detected.extension}`
          const file = new ZipPassThrough(filename)
          zip.add(file)
          file.push(bytes, true)
          added += 1
        })
      } catch (error) {
        if (isAbortError(error)) {
          throw error
        }
      } finally {
        completed += 1
        onProgress(completed, photos.length)
      }
    })

    await writeQueue
  } catch (error) {
    zip.terminate()
    throw error instanceof Error ? error : new Error('Сборка архива прервана')
  }

  if (added === 0) {
    zip.terminate()
    return { state: PhotosZipBuildState.Empty, mismatches }
  }

  zip.end()
  const zipBytes = await zipDone
  return { state: PhotosZipBuildState.Ready, added, zipBytes, mismatches }
}
