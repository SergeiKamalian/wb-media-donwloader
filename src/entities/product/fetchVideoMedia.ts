import { HttpError, NetworkError } from '../../shared/api/http.ts'
import { isAbortError } from '../../shared/lib/isAbortError.ts'

async function requestVideo(
  url: string,
  signal: AbortSignal | undefined,
): Promise<Response> {
  let response: Response

  try {
    response = await fetch(url, { signal })
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }
    throw new NetworkError(url, error)
  }

  if (!response.ok) {
    throw new HttpError(response.status, response.statusText, url)
  }

  return response
}

export async function fetchVideoPlaylistText(
  url: string,
  signal?: AbortSignal,
): Promise<string> {
  const response = await requestVideo(url, signal)
  return response.text()
}

export async function fetchVideoSegmentBytes(
  url: string,
  signal: AbortSignal,
): Promise<Uint8Array> {
  const response = await requestVideo(url, signal)
  const buffer = await response.arrayBuffer()
  return new Uint8Array(buffer)
}
