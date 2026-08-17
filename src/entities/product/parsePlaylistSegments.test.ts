import { describe, expect, it } from 'vitest'
import { parsePlaylistSegments } from './parsePlaylistSegments.ts'

const playlistUrl =
  'https://videonme.test/vol53/part44505/445051493/hls/1440p/index.m3u8'

describe('parsePlaylistSegments', () => {
  it('берёт только строки без решётки и достраивает относительный путь', () => {
    const text = [
      '#EXTM3U',
      '#EXTINF:4.566',
      '1.ts',
      '#EXTINF:2.733',
      '2.ts',
      '#EXT-X-ENDLIST',
      '',
    ].join('\n')

    expect(parsePlaylistSegments(text, playlistUrl)).toEqual([
      'https://videonme.test/vol53/part44505/445051493/hls/1440p/1.ts',
      'https://videonme.test/vol53/part44505/445051493/hls/1440p/2.ts',
    ])
  })

  it('оставляет абсолютный адрес сегмента как есть', () => {
    const text = ['#EXTM3U', 'https://cdn.test/abs/a.ts', 'b.ts'].join('\n')

    expect(parsePlaylistSegments(text, playlistUrl)).toEqual([
      'https://cdn.test/abs/a.ts',
      'https://videonme.test/vol53/part44505/445051493/hls/1440p/b.ts',
    ])
  })
})
