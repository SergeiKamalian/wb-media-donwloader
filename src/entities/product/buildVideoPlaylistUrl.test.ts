import { describe, expect, it } from 'vitest'
import { buildVideoPlaylistUrl } from './buildVideoPlaylistUrl.ts'
import type { BasketRange } from './basketRanges.ts'

const testRanges: readonly BasketRange[] = [
  { volRangeFrom: 0, volRangeTo: 71, host: 'videonme-06.test' },
  { volRangeFrom: 72, volRangeTo: 143, host: 'videonme-12.test' },
]

describe('buildVideoPlaylistUrl', () => {
  it('собирает плейлист для артикула из первой половины диапазонов', () => {
    expect(buildVideoPlaylistUrl(445051493, testRanges)).toBe(
      'https://videonme-06.test/vol53/part44505/445051493/hls/1440p/index.m3u8',
    )
  })

  it('собирает плейлист для артикула из второй половины диапазонов', () => {
    expect(buildVideoPlaylistUrl(445231435, testRanges)).toBe(
      'https://videonme-12.test/vol139/part44523/445231435/hls/1440p/index.m3u8',
    )
  })

  it('бросает ошибку, если остаток от деления вне всех диапазонов', () => {
    const narrowRanges: readonly BasketRange[] = [
      { volRangeFrom: 72, volRangeTo: 143, host: 'videonme-12.test' },
    ]

    expect(() => buildVideoPlaylistUrl(445051493, narrowRanges)).toThrow(
      'Артикул не попал ни в один диапазон корзин: vol=53',
    )
  })
})
