import { describe, expect, it } from 'vitest'
import { buildPhotoUrl } from './buildPhotoUrl.ts'
import type { BasketRange } from './basketRanges.ts'

const testRanges: readonly BasketRange[] = [
  { volRangeFrom: 0, volRangeTo: 143, host: 'basket-01.test' },
  { volRangeFrom: 144, volRangeTo: 287, host: 'basket-02.test' },
  { volRangeFrom: 288, volRangeTo: 431, host: 'basket-03.test' },
]

describe('buildPhotoUrl', () => {
  it('собирает ссылку для артикула из середины первого диапазона', () => {
    const article = 7_050_000

    expect(buildPhotoUrl(article, 1, testRanges)).toBe(
      'https://basket-01.test/vol70/part7050/7050000/images/big/1.webp',
    )
  })

  it('собирает ссылку для артикула из середины диапазона в середине списка', () => {
    const article = 21_500_000

    expect(buildPhotoUrl(article, 3, testRanges)).toBe(
      'https://basket-02.test/vol215/part21500/21500000/images/big/3.webp',
    )
  })

  it('попадает в диапазон на границе vol_range_to', () => {
    const article = 14_300_000

    expect(buildPhotoUrl(article, 1, testRanges)).toBe(
      'https://basket-01.test/vol143/part14300/14300000/images/big/1.webp',
    )
  })

  it('бросает ошибку, если артикул вне всех диапазонов', () => {
    const article = 50_000_000

    expect(() => buildPhotoUrl(article, 1, testRanges)).toThrow(
      'Артикул не попал ни в один диапазон корзин: vol=500',
    )
  })
})
