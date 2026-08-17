import { useRef, useState } from 'react'
import {
  downloadPhotosZip,
  PhotosZipBuildState,
  type PhotoDownloadItem,
} from './downloadPhotosZip.ts'
import type { ImageTypeMismatch } from './detectImageExtension.ts'

export enum PhotosZipState {
  Idle = 'idle',
  Running = 'running',
  Empty = 'empty',
}

export type PhotosZipView = {
  state: PhotosZipState
  completed: number
  total: number
  mismatches: readonly ImageTypeMismatch[]
  start: (
    article: number,
    photos: readonly PhotoDownloadItem[],
  ) => Promise<void>
  cancel: () => void
  reset: () => void
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
}

function saveZip(article: number, zipBytes: Uint8Array) {
  const blob = new Blob([bytesToArrayBuffer(zipBytes)], {
    type: 'application/zip',
  })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = `${article}-photos.zip`
  link.click()
  URL.revokeObjectURL(objectUrl)
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function useDownloadPhotosZip(): PhotosZipView {
  const [state, setState] = useState(PhotosZipState.Idle)
  const [completed, setCompleted] = useState(0)
  const [total, setTotal] = useState(0)
  const [mismatches, setMismatches] = useState<readonly ImageTypeMismatch[]>([])
  const abortRef = useRef<AbortController | null>(null)
  const runningRef = useRef(false)

  async function start(
    article: number,
    photos: readonly PhotoDownloadItem[],
  ): Promise<void> {
    if (runningRef.current) {
      return
    }

    runningRef.current = true
    const controller = new AbortController()
    abortRef.current = controller
    setState(PhotosZipState.Running)
    setCompleted(0)
    setTotal(photos.length)
    setMismatches([])

    try {
      const result = await downloadPhotosZip(
        article,
        photos,
        controller.signal,
        (nextCompleted, nextTotal) => {
          setCompleted(nextCompleted)
          setTotal(nextTotal)
        },
      )

      setMismatches(result.mismatches)

      if (result.state === PhotosZipBuildState.Empty) {
        setState(PhotosZipState.Empty)
        return
      }

      saveZip(article, result.zipBytes)
      setState(PhotosZipState.Idle)
    } catch (error) {
      if (isAbortError(error)) {
        setState(PhotosZipState.Idle)
        return
      }

      setState(PhotosZipState.Empty)
    } finally {
      runningRef.current = false
      abortRef.current = null
    }
  }

  function cancel() {
    abortRef.current?.abort()
  }

  function reset() {
    abortRef.current?.abort()
    setState(PhotosZipState.Idle)
    setCompleted(0)
    setTotal(0)
    setMismatches([])
  }

  return { state, completed, total, mismatches, start, cancel, reset }
}
