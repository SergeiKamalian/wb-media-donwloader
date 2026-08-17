import { useQuery } from '@tanstack/react-query'
import { type BasketRange } from './basketRanges.ts'
import { buildVideoPlaylistUrl } from './buildVideoPlaylistUrl.ts'
import { probeVideoPlaylist } from './probeVideoPlaylist.ts'

export enum VideoPlaylistQueryState {
  Hidden = 'hidden',
  Available = 'available',
}

export type VideoPlaylistQueryView =
  | { state: VideoPlaylistQueryState.Hidden }
  | { state: VideoPlaylistQueryState.Available; url: string }

function playlistUrlOrNull(
  article: number | null,
  ranges: readonly BasketRange[] | null,
): string | null {
  if (article === null || ranges === null || ranges.length === 0) {
    return null
  }

  try {
    return buildVideoPlaylistUrl(article, ranges)
  } catch {
    return null
  }
}

export function useVideoPlaylistQuery(
  article: number | null,
  ranges: readonly BasketRange[] | null,
): VideoPlaylistQueryView {
  const url = playlistUrlOrNull(article, ranges)

  const query = useQuery({
    queryKey: ['video-playlist', url],
    queryFn: () => {
      if (url === null) {
        throw new Error('Нет ссылки на плейлист')
      }
      return probeVideoPlaylist(url)
    },
    enabled: url !== null,
    retry: 1,
  })

  if (url === null || query.isPending || query.data !== true) {
    return { state: VideoPlaylistQueryState.Hidden }
  }

  return { state: VideoPlaylistQueryState.Available, url }
}
