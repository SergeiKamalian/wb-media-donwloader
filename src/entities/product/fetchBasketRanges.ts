import { requestJson } from '../../shared/api/http.ts'
import { upstreamsPath } from '../../shared/api/paths.ts'
import {
  parseMediabasketRanges,
  parseVideonmeRanges,
  type BasketRange,
} from './basketRanges.ts'

export type BasketMaps = {
  media: BasketRange[]
  video: BasketRange[]
}

export async function fetchBasketRanges(): Promise<BasketMaps> {
  const payload = await requestJson(upstreamsPath)
  return {
    media: parseMediabasketRanges(payload),
    video: parseVideonmeRanges(payload),
  }
}
