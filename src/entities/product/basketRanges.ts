export type BasketRange = {
  volRangeFrom: number
  volRangeTo: number
  host: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readFiniteNumber(
  record: Record<string, unknown>,
  field: string,
): number {
  const value = record[field]
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Поле ${field} отсутствует или не число`)
  }
  return value
}

function readString(record: Record<string, unknown>, field: string): string {
  const value = record[field]
  if (typeof value !== 'string' || value === '') {
    throw new Error(`Поле ${field} отсутствует или не строка`)
  }
  return value
}

function parseBasketRange(value: unknown): BasketRange {
  if (!isRecord(value)) {
    throw new Error('Элемент диапазона корзин не объект')
  }

  return {
    volRangeFrom: readFiniteNumber(value, 'vol_range_from'),
    volRangeTo: readFiniteNumber(value, 'vol_range_to'),
    host: readString(value, 'host'),
  }
}

export function parseMediabasketRanges(payload: unknown): BasketRange[] {
  if (!isRecord(payload)) {
    throw new Error('Ответ upstreams не объект')
  }

  const origin = payload.origin
  if (!isRecord(origin)) {
    throw new Error('Поле origin отсутствует или не объект')
  }

  const routeMap = origin.mediabasket_route_map
  if (!Array.isArray(routeMap) || routeMap.length === 0) {
    throw new Error('Поле origin.mediabasket_route_map отсутствует или пустое')
  }

  const ranges: BasketRange[] = []

  for (const entry of routeMap) {
    if (!isRecord(entry)) {
      throw new Error('Элемент mediabasket_route_map не объект')
    }

    const hosts = entry.hosts
    if (!Array.isArray(hosts)) {
      throw new Error('Поле hosts отсутствует или не массив')
    }

    for (const host of hosts) {
      ranges.push(parseBasketRange(host))
    }
  }

  if (ranges.length === 0) {
    throw new Error('Карта mediabasket не содержит диапазонов')
  }

  return ranges
}

export function findBasketHost(vol: number, ranges: readonly BasketRange[]): string {
  for (const range of ranges) {
    if (vol >= range.volRangeFrom && vol <= range.volRangeTo) {
      return range.host
    }
  }

  throw new Error(
    `Артикул не попал ни в один диапазон корзин: vol=${vol}`,
  )
}
