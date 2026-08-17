import { useQuery } from '@tanstack/react-query'
import { type BasketRange } from './basketRanges.ts'
import { fallbackBasketRanges } from './fallbackBasketRanges.ts'
import { fetchBasketRanges } from './fetchBasketRanges.ts'

export enum BasketRangesQueryState {
  Loading = 'loading',
  Ready = 'ready',
  Fallback = 'fallback',
}

export type BasketRangesQueryView =
  | { state: BasketRangesQueryState.Loading }
  | {
      state: BasketRangesQueryState.Ready
      media: readonly BasketRange[]
      video: readonly BasketRange[]
    }
  | {
      state: BasketRangesQueryState.Fallback
      media: readonly BasketRange[]
      video: readonly BasketRange[]
      error: Error
      retry: () => void
    }

const rangesStaleTimeMs = 6 * 60 * 60 * 1000

export function useBasketRangesQuery(): BasketRangesQueryView {
  const query = useQuery({
    queryKey: ['basket-ranges'],
    queryFn: fetchBasketRanges,
    staleTime: rangesStaleTimeMs,
    retry: 1,
  })

  if (query.isPending) {
    return { state: BasketRangesQueryState.Loading }
  }

  if (query.isError) {
    const { error } = query
    const resolvedError =
      error instanceof Error
        ? error
        : new Error('Неизвестная ошибка запроса корзин CDN')
    return {
      state: BasketRangesQueryState.Fallback,
      media: fallbackBasketRanges,
      video: [],
      error: resolvedError,
      retry() {
        void query.refetch()
      },
    }
  }

  const maps = query.data
  if (maps === undefined) {
    return { state: BasketRangesQueryState.Loading }
  }

  return {
    state: BasketRangesQueryState.Ready,
    media: maps.media,
    video: maps.video,
  }
}
