import { useRef, useState } from 'react'
import { fetchVideoPlaylistText } from '../../entities/product/fetchVideoMedia.ts'
import { parsePlaylistSegments } from '../../entities/product/parsePlaylistSegments.ts'
import { assembleVideoMp4, downloadVideoSegments } from './downloadVideoMp4.ts'

export enum VideoDownloadState {
  Closed = 'closed',
  LoadingPlaylist = 'loadingPlaylist',
  Confirm = 'confirm',
  Downloading = 'downloading',
  Assembling = 'assembling',
  Error = 'error',
}

export type VideoDownloadView = {
  state: VideoDownloadState
  playlistUrl: string | null
  segmentCount: number
  completed: number
  error: string | null
  open: (article: number, playlistUrl: string) => void
  start: () => void
  retry: () => void
  close: () => void
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
}

function saveMp4(article: number, bytes: Uint8Array) {
  const blob = new Blob([bytesToArrayBuffer(bytes)], { type: 'video/mp4' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = `${article}.mp4`
  link.click()
  URL.revokeObjectURL(objectUrl)
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function useDownloadVideoMp4(): VideoDownloadView {
  const [state, setState] = useState(VideoDownloadState.Closed)
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null)
  const [segmentUrls, setSegmentUrls] = useState<readonly string[]>([])
  const [article, setArticle] = useState<number | null>(null)
  const [completed, setCompleted] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const runningRef = useRef(false)

  function close() {
    abortRef.current?.abort()
    runningRef.current = false
    abortRef.current = null
    setState(VideoDownloadState.Closed)
    setPlaylistUrl(null)
    setSegmentUrls([])
    setArticle(null)
    setCompleted(0)
    setError(null)
  }

  function open(nextArticle: number, nextPlaylistUrl: string) {
    abortRef.current?.abort()
    runningRef.current = false
    const controller = new AbortController()
    abortRef.current = controller
    setArticle(nextArticle)
    setPlaylistUrl(nextPlaylistUrl)
    setSegmentUrls([])
    setCompleted(0)
    setError(null)
    setState(VideoDownloadState.LoadingPlaylist)

    void fetchVideoPlaylistText(nextPlaylistUrl, controller.signal)
      .then((text) => {
        if (controller.signal.aborted) {
          return
        }

        const urls = parsePlaylistSegments(text, nextPlaylistUrl)
        if (urls.length === 0) {
          setError('В плейлисте нет сегментов')
          setState(VideoDownloadState.Error)
          return
        }

        setSegmentUrls(urls)
        setState(VideoDownloadState.Confirm)
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) {
          return
        }

        const message =
          caught instanceof Error
            ? caught.message
            : 'Не удалось прочитать плейлист'
        setError(message)
        setState(VideoDownloadState.Error)
      })
  }

  function retry() {
    if (article === null || playlistUrl === null) {
      return
    }

    if (segmentUrls.length === 0) {
      open(article, playlistUrl)
      return
    }

    start()
  }

  function start() {
    if (runningRef.current || article === null || segmentUrls.length === 0) {
      return
    }

    runningRef.current = true
    const controller = new AbortController()
    abortRef.current = controller
    setCompleted(0)
    setError(null)
    setState(VideoDownloadState.Downloading)

    const currentArticle = article

    void downloadVideoSegments(
      segmentUrls,
      controller.signal,
      (nextCompleted) => {
        setCompleted(nextCompleted)
      },
    )
      .then(async (segments) => {
        if (controller.signal.aborted) {
          return
        }

        setState(VideoDownloadState.Assembling)
        const bytes = await assembleVideoMp4(segments)
        if (controller.signal.aborted) {
          return
        }

        saveMp4(currentArticle, bytes)
        close()
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) {
          return
        }

        const message =
          caught instanceof Error ? caught.message : 'Не удалось собрать видео'
        setError(message)
        setState(VideoDownloadState.Error)
      })
      .finally(() => {
        runningRef.current = false
      })
  }

  return {
    state,
    playlistUrl,
    segmentCount: segmentUrls.length,
    completed,
    error,
    open,
    start,
    retry,
    close,
  }
}
