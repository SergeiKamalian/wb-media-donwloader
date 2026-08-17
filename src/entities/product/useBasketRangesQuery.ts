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
  | { state: BasketRangesQueryState.Ready; ranges: readonly BasketRange[] }
  | {
      state: BasketRangesQueryState.Fallback
      ranges: readonly BasketRange[]
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
      ranges: fallbackBasketRanges,
      error: resolvedError,
      retry() {
        void query.refetch()
      },
    }
  }

  const ranges = query.data
  if (ranges === undefined) {
    return { state: BasketRangesQueryState.Loading }
  }

  return { state: BasketRangesQueryState.Ready, ranges }
}
