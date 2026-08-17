import { requestJson } from '../../shared/api/http.ts'
import { upstreamsPath } from '../../shared/api/paths.ts'
import { parseMediabasketRanges, type BasketRange } from './basketRanges.ts'

export async function fetchBasketRanges(): Promise<BasketRange[]> {
  const payload = await requestJson(upstreamsPath)
  return parseMediabasketRanges(payload)
}
