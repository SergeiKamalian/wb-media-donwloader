import { useQuery } from '@tanstack/react-query'
import { fetchProductCard } from './fetchProductCard.ts'
import { parseArticle } from './parseArticle.ts'
import {
  ProductCardLookupState,
  type ProductCard,
} from './productCard.ts'

export enum ProductCardQueryState {
  Idle = 'idle',
  Loading = 'loading',
  Found = 'found',
  NotFound = 'notFound',
  Error = 'error',
}

export type ProductCardQueryView =
  | { state: ProductCardQueryState.Idle }
  | { state: ProductCardQueryState.Loading }
  | { state: ProductCardQueryState.Found; product: ProductCard }
  | { state: ProductCardQueryState.NotFound }
  | { state: ProductCardQueryState.Error; error: Error; retry: () => void }

export function useProductCardQuery(articleInput: string): ProductCardQueryView {
  const article = parseArticle(articleInput)

  const query = useQuery({
    queryKey: ['product-card', article],
    queryFn: () => {
      if (article === null) {
        throw new Error('Артикул не задан')
      }
      return fetchProductCard(article)
    },
    enabled: article !== null,
    retry: 1,
  })

  if (article === null) {
    return { state: ProductCardQueryState.Idle }
  }

  if (query.isPending) {
    return { state: ProductCardQueryState.Loading }
  }

  if (query.isError) {
    const { error } = query
    const resolvedError =
      error instanceof Error
        ? error
        : new Error('Неизвестная ошибка запроса карточки')
    return {
      state: ProductCardQueryState.Error,
      error: resolvedError,
      retry() {
        void query.refetch()
      },
    }
  }

  const lookup = query.data
  if (lookup === undefined) {
    return { state: ProductCardQueryState.Loading }
  }

  if (lookup.state === ProductCardLookupState.Found) {
    return { state: ProductCardQueryState.Found, product: lookup.product }
  }

  return { state: ProductCardQueryState.NotFound }
}
