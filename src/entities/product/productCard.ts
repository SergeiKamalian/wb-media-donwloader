export type ProductCard = {
  id: number
  name: string
  pics: number
  root: number
}

export enum ProductCardLookupState {
  Found = 'found',
  NotFound = 'notFound',
}

export type ProductCardLookup =
  | { state: ProductCardLookupState.Found; product: ProductCard }
  | { state: ProductCardLookupState.NotFound }

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
  if (typeof value !== 'string') {
    throw new Error(`Поле ${field} отсутствует или не строка`)
  }
  return value
}

export function parseProductCardLookup(payload: unknown): ProductCardLookup {
  if (!isRecord(payload)) {
    throw new Error('Ответ карточки не объект')
  }

  const products = payload.products
  if (!Array.isArray(products)) {
    throw new Error('Поле products отсутствует или не массив')
  }

  const first = products[0]
  if (first === undefined) {
    return { state: ProductCardLookupState.NotFound }
  }

  if (!isRecord(first)) {
    throw new Error('Элемент products не объект')
  }

  return {
    state: ProductCardLookupState.Found,
    product: {
      id: readFiniteNumber(first, 'id'),
      name: readString(first, 'name'),
      pics: readFiniteNumber(first, 'pics'),
      root: readFiniteNumber(first, 'root'),
    },
  }
}
