import { requestJson } from '../../shared/api/http.ts'
import { cardDetailPath } from '../../shared/api/paths.ts'
import {
  parseProductCardLookup,
  type ProductCardLookup,
} from './productCard.ts'

// Для прода регион должен приходить от пользователя, а не быть зашитым.
const wbDest = -1257786

export async function fetchProductCard(
  article: number,
): Promise<ProductCardLookup> {
  const params = new URLSearchParams({
    dest: String(wbDest),
    nm: String(article),
  })
  const payload = await requestJson(`${cardDetailPath}?${params.toString()}`)
  return parseProductCardLookup(payload)
}
